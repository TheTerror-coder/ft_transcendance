import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export async function initScene() {
    const scene = new THREE.Scene();
    const cameraPlayer = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(0, 20, 10);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(0, -20, 10);
    
    const oceanColor = 0x1E90FF;
    scene.background = new THREE.Color(oceanColor);
    let {boatGroup1, boatGroup2, ocean, ball} = await initObject(scene);
    loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, boatGroup1, boatGroup2)
    return { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball };
}

function initBoundaryLines() {
    const material = new THREE.LineBasicMaterial({ color: 0xFF69B4 }); // Rose
    const lines = new THREE.Group();

    // Lignes verticales (x = ±80)
    const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-80, -55, 0),
        new THREE.Vector3(-80, 55, 0)
    ]);
    const verticalLine1 = new THREE.Line(verticalGeometry, material);
    const verticalLine2 = new THREE.Line(verticalGeometry.clone(), material);
    verticalLine2.position.x = 160; // Pour positionner à x = 80

    // Lignes horizontales (y = ±55)
    const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-80, -55, 0),
        new THREE.Vector3(80, -55, 0)
    ]);
    const horizontalLine1 = new THREE.Line(horizontalGeometry, material);
    const horizontalLine2 = new THREE.Line(horizontalGeometry.clone(), material);
    horizontalLine2.position.y = 110; // Pour positionner à y = 55

    lines.add(verticalLine1);
    lines.add(verticalLine2);
    lines.add(horizontalLine1);
    lines.add(horizontalLine2);

    return lines;
}

function loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, bateau1, bateau2) {
    const boundaryLines = initBoundaryLines();
    
    scene.add(ball);
    scene.add(ocean);
    scene.add(ambientLight);
    scene.add(directionalLight1);
    scene.add(directionalLight2);
    scene.add(bateau1);
    scene.add(bateau2);
    scene.add(boundaryLines); // Ajouter les lignes de délimitation
}

async function initObject(scene)
{
    const GLTFloader = new GLTFLoader();
    let bateau = await initBateaux(scene, GLTFloader);
    console.log('bateau:', bateau);
    let cannonGroup = await initCannons(scene);
    console.log('CannonGroup:', cannonGroup);
    let boatGroup1 = await CreateBoatGroup(scene, bateau.bateauTeam1, cannonGroup.get('cannonTeam1'), 1);
    let boatGroup2 = await CreateBoatGroup(scene, bateau.bateauTeam2, cannonGroup.get('cannonTeam2'), 2);
    console.log('boatGroup1 : ', boatGroup1);
    console.log('boatGroup2 : ', boatGroup2);
    let ocean = await initOceans(scene, new THREE.TextureLoader());
    let ball = await initBall();

    return {boatGroup1, boatGroup2, ocean, ball};
}

function initBall() {
    return new Promise((resolve, reject) => {
        try {
            const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
            console.log('Ball initialized successfully');
            resolve(ball);
        } catch (error) {
            console.error('Error initializing ball:', error);
            reject(error);
        }
    });
}

function initBateaux(scene, gltfLoader) {
    return new Promise((resolve, reject) => {
        gltfLoader.load('../../static/pong/assets/models/onepiece.gltf', function (gltf) {
            const texture = new THREE.TextureLoader().load('../../static/pong/assets/textures/bateau_texture.png');
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
            const bateauTeam1 = gltf.scene.clone();
            // bateauTeam1.position.set(0, 20, -1);
            bateauTeam1.scale.set(10, 5, 5);

            const bateauTeam2 = gltf.scene.clone();
            // bateauTeam2.position.set(0, -20, -1);
            bateauTeam2.scale.set(10, 5, 5);

            console.log('Boat models loaded successfully');
            resolve({ bateauTeam1, bateauTeam2 });
        }, undefined, function (error) {
            console.error('Error loading the boat models:', error);
            reject(error);
        });
    });
}

function initOceans(scene, textureLoader) {
    return new Promise((resolve, reject) => {
        const oceanTexture = textureLoader.load('../../static/pong/assets/textures/ocean_texture.jpg', 
            function(texture) {
                const oceanGeometry = new THREE.PlaneGeometry(5000, 5000);
                const oceanMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    side: THREE.FrontSide
                });
                
                const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
                ocean.position.y = -1;

                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.repeat.set(1, 1);

                console.log('Plan océanique créé avec succès');
                resolve(ocean);
            },
            undefined,
            function(error) {
                console.error('Error loading the ocean texture:', error);
                reject(error);
            }
        );
    });
}

function loadCannons_Support(MTLloader, OBJLoader) {
    return new Promise((resolve, reject) => {
        MTLloader.setPath('../../static/pong/assets/textures/');
        MTLloader.load('Juste_Support.mtl', function(materials) {
            materials.preload();
            OBJLoader.setMaterials(materials);
            OBJLoader.setPath('../../static/pong/assets/models/');
            OBJLoader.load('Juste_Support.obj', function(object) {
                const cannonSupport1 = object.clone();
                const cannonSupport2 = object.clone();
                console.log('Cannon supports loaded successfully');
                console.log('Cannon support 1 :', cannonSupport1);
                console.log('Cannon support 2 :', cannonSupport2);
                resolve({ cannonSupport1, cannonSupport2 });
            }, undefined, function (error) {
                console.error('Error loading the cannon support model:', error);
                reject(error);
            });
        }, undefined, function (error) {
            console.error('Error loading the materials:', error);
            reject(error);
        });
    });
}

function loadCannons_Tube(MTLloader, OBJLoader) {
    return new Promise((resolve, reject) => {
        // Charger les tubes de canon
        MTLloader.load('Juste_Cannon.mtl', function(materials) {
            materials.preload();
            OBJLoader.setMaterials(materials);
            OBJLoader.load('Juste_Cannon.obj', function(object) {
                const cannonTube1 = object.clone();
                const cannonTube2 = object.clone();
                console.log('Cannon tubes loaded successfully');
                resolve({ cannonTube1, cannonTube2 });
            }, undefined, function (error) {
                console.error('Error loading the cannon tube model:', error);
                reject(error);
            });
        });
    });
}

async function initCannons(scene) {
    const MTLloader = new MTLLoader();
    const objLoader = new OBJLoader(); // Assurez-vous d'utiliser une minuscule pour l'instance
    let cannonGroup = new Map();

    try {
        const { cannonSupport1, cannonSupport2 } = await loadCannons_Support(MTLloader, objLoader);
        const { cannonTube1, cannonTube2 } = await loadCannons_Tube(MTLloader, objLoader);

        cannonSupport1.name = `cannonSupportTeam1`;
        cannonSupport2.name = `cannonSupportTeam2`;
        cannonTube1.name = `cannonTubeTeam1`;
        cannonTube2.name = `cannonTubeTeam2`;

        // Créer les groupes de canons pour chaque équipe
        let cannonTeam1 = new THREE.Group();
        let cannonTeam2 = new THREE.Group();
        let cannon1_tube_group = new THREE.Group();
        let cannon2_tube_group = new THREE.Group();

        cannonTeam1.name = `cannonTeam1`;
        cannonTeam2.name = `cannonTeam2`;
        cannon1_tube_group.name = `cannon1_tube_group`;
        cannon2_tube_group.name = `cannon2_tube_group`;

        // Ajouter les tubes de canon dans leurs groupes respectifs
        cannon1_tube_group.add(cannonTube1);
        cannon2_tube_group.add(cannonTube2);

        // Ajouter les groupes de tubes de canon aux groupes de canons
        cannonTeam1.add(cannon1_tube_group);
        cannonTeam2.add(cannon2_tube_group);

        // Ajouter les supports de canon aux groupes de canons
        cannonTeam1.add(cannonSupport1);
        cannonTeam2.add(cannonSupport2);

        cannonTeam1.scale.set(0.01, 0.03, 0.03);
        cannonTeam2.scale.set(0.01, 0.03, 0.03);

        // Ajouter les groupes de canons à la Map
        cannonGroup.set('cannonTeam1', cannonTeam1);
        cannonGroup.set('cannonTeam2', cannonTeam2);

        return cannonGroup;
    } catch (error) {
        console.error('Error initializing cannons:', error);
    }
}

async function CreateBoatGroup(scene, bateau, cannon, teamId)
{
    let boatGroup = new THREE.Group();
    bateau.name = `bateauTeam${teamId}`;
    bateau.rotation.set(Math.PI / 2, 0, 0);
    cannon.name = `cannonTeam${teamId}`;
    boatGroup.add(bateau);
    boatGroup.add(cannon);
    
    // Positionner et orienter le canon
    if (teamId === 1) {
        boatGroup.position.set(0, 35, -1);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(boatGroup.position.x - (boatGroup.scale.x / 2) - 2, boatGroup.scale.y - 3.18, boatGroup.scale.z + 3);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).rotation.set(0, 0, -Math.PI / 2);
    } else if (teamId === 2) {
        boatGroup.position.set(0, -35, -1);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(boatGroup.position.x - (boatGroup.scale.x / 2) - 2, boatGroup.scale.y + 2.88, boatGroup.scale.z + 3);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).rotation.set(0, 0, Math.PI / 2);
    }
    
    // Créer la hitbox pour les collisions
    const boundingBox = new THREE.Box3().setFromObject(bateau);
    boatGroup.userData.hitbox = {
        min: {
            x: boundingBox.min.x + 7,
            y: boundingBox.min.y + (teamId === 1 ? 2 : 0),
            z: boundingBox.min.z
        },
        max: {
            x: boundingBox.max.x,
            y: boundingBox.max.y - (teamId === 2 ? 2 : 0),
            z: boundingBox.max.z
        }
    };

    return boatGroup;
}

function showBoundingBox(object, scene) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const helper = new THREE.Box3Helper(boundingBox, 0xffff00);
    scene.add(helper);
}
