import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export async function initScene(Team1, Team2, currentTeam) {
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
    let {boatGroup1, boatGroup2, ocean, ball} = await initObject(scene, Team1, Team2, currentTeam);
    loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, boatGroup1, boatGroup2);
    let display = [ocean, ambientLight, directionalLight1, directionalLight2];
    return { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display };
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

export function unloadScene(ball, scene, bateau1, bateau2, display, renderer) {
    // Supprimer la balle
    if (ball) {
        scene.remove(ball);
        if (ball.geometry) ball.geometry.dispose();
        if (ball.material) ball.material.dispose();
    }

    // Supprimer les bateaux
    if (bateau1) {
        scene.remove(bateau1);
        bateau1.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    if (bateau2) {
        scene.remove(bateau2);
        bateau2.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    // Supprimer les éléments d'affichage
    if (display) {
        for (const item of display) {
            if (item) {
                scene.remove(item);
                if (item.geometry) item.geometry.dispose();
                if (item.material) item.material.dispose();
            }
        }
    }

    // Nettoyer le reste de la scène
    while(scene.children.length > 0) { 
        const object = scene.children[0];
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    }

    // Nettoyer le renderer
    if (renderer) {
        renderer.renderLists.dispose();
        renderer.dispose();
        // Supprimer l'élément canvas du DOM
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    // Vider la scène
    scene.clear();

    // Force la mise à jour du rendu
    if (renderer) {
        renderer.render(scene, new THREE.PerspectiveCamera());
    }
}

async function initObject(scene, Team1, Team2, currentTeam)
{
    const GLTFloader = new GLTFLoader();
    let bateau = await initBateaux(scene, GLTFloader);
    console.log('bateau:', bateau);
    let cannonGroup = await initCannons(scene);
    console.log('CannonGroup:', cannonGroup);
    let boatGroup1 = await CreateBoatGroup(scene, bateau.bateauTeam1, cannonGroup.get('cannonTeam1'), 1, Team1.getBoatSavedPos(), Team1.getCannonSavedPos());
    let boatGroup2 = await CreateBoatGroup(scene, bateau.bateauTeam2, cannonGroup.get('cannonTeam2'), 2, Team2.getBoatSavedPos(), Team2.getCannonSavedPos());
    console.log('boatGroup1 : ', boatGroup1);
    console.log('boatGroup2 : ', boatGroup2);
    let ocean = await initOceans(scene, new THREE.TextureLoader());
    let ball = await initBall(currentTeam.getBallSavedPos());

    return {boatGroup1, boatGroup2, ocean, ball};
}

function initBall(ballSavedPos) {
    return new Promise((resolve, reject) => {
        try {
            const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
            console.log('Ball initialized successfully');
            if (ballSavedPos.x != 0 && ballSavedPos.y != 0 && ballSavedPos.z != 0)
                ball.position.set(ballSavedPos.x, ballSavedPos.y, ballSavedPos.z);
            else
                ball.position.set(0, 0, 0);
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
    const objLoader = new OBJLoader();
    let cannonGroup = new Map();

    try {
        const { cannonSupport1, cannonSupport2 } = await loadCannons_Support(MTLloader, objLoader);
        const { cannonTube1, cannonTube2 } = await loadCannons_Tube(MTLloader, objLoader);
        
        // Créer les points de tip avec un visuel
        const tipGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const tipMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,  // Rouge
            transparent: true,
            opacity: 0.8
        });
        
        const cannonTip1 = new THREE.Mesh(tipGeometry, tipMaterial);
        const cannonTip2 = new THREE.Mesh(tipGeometry, tipMaterial);
        
        // Nommer les objets
        cannonTip1.name = `cannonTipTeam1`;
        cannonTip2.name = `cannonTipTeam2`;
        
        let x = 24;
        let y = 0;
        let z = 50;

        // Position des tips par rapport aux tubes
        cannonTip1.position.set(115, 0, 60);
        cannonTip2.position.set(115, 0, 60);

        // Attacher les tips directement aux tubes
        cannonTube1.add(cannonTip1);
        cannonTube2.add(cannonTip2);

        // Créer et configurer les groupes
        let cannonTeam1 = new THREE.Group();
        let cannonTeam2 = new THREE.Group();
        let cannon1_tube_group = new THREE.Group();
        let cannon2_tube_group = new THREE.Group();

        // Nommer les groupes
        cannonTeam1.name = `cannonTeam1`;
        cannonTeam2.name = `cannonTeam2`;
        cannon1_tube_group.name = `cannon1_tube_group`;
        cannon2_tube_group.name = `cannon2_tube_group`;

        // Configurer les tubes
        cannonTube1.position.set(-x, y, -z);
        cannonTube2.position.set(-x, y, -z);

        // Ajouter les tubes aux groupes
        cannon1_tube_group.add(cannonTube1);
        cannon2_tube_group.add(cannonTube2);

        // Positionner les groupes de tubes
        cannon1_tube_group.position.set(x, y, z);
        cannon2_tube_group.position.set(x, y, z);

        // Assembler les groupes finaux
        cannonTeam1.add(cannon1_tube_group);
        cannonTeam2.add(cannon2_tube_group);
        cannonTeam1.add(cannonSupport1);
        cannonTeam2.add(cannonSupport2);
        
        // Appliquer l'échelle finale
        cannonTeam1.scale.set(0.01, 0.03, 0.03);
        cannonTeam2.scale.set(0.01, 0.03, 0.03);

        // Ajouter à la Map
        cannonGroup.set('cannonTeam1', cannonTeam1);
        cannonGroup.set('cannonTeam2', cannonTeam2);

        return cannonGroup;
    } catch (error) {
        console.error('Error initializing cannons:', error);
    }
}

async function CreateBoatGroup(scene, bateau, cannon, teamId, boatSavedPos, cannonSavedPos)
{
    let boatGroup = new THREE.Group();
    bateau.name = `bateauTeam${teamId}`;
    bateau.rotation.set(Math.PI / 2, 0, 0);
    cannon.name = `cannonTeam${teamId}`;
    boatGroup.add(bateau);
    boatGroup.add(cannon);
    
    // Positionner et orienter le canon
    if (teamId === 1) {
        if (boatSavedPos.x != 0 && boatSavedPos.y != 0 && boatSavedPos.z != 0)
            boatGroup.position.set(boatSavedPos.x, 35, -1);
        else
            boatGroup.position.set(0, 35, -1);
        if (cannonSavedPos.x != 0 && cannonSavedPos.y != 0 && cannonSavedPos.z != 0)
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(cannonSavedPos.x, cannonSavedPos.y, cannonSavedPos.z);
        else
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(boatGroup.position.x - (boatGroup.scale.x / 2) - 2, boatGroup.scale.y - 3.18, boatGroup.scale.z + 3);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).rotation.set(0, 0, -Math.PI / 2);
    } else if (teamId === 2) {
        if (boatSavedPos.x != 0 && boatSavedPos.y != 0 && boatSavedPos.z != 0)
            boatGroup.position.set(boatSavedPos.x, -35, -1);
        else
            boatGroup.position.set(0, -35, -1);
        if (cannonSavedPos.x != 0 && cannonSavedPos.y != 0 && cannonSavedPos.z != 0)
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(cannonSavedPos.x, cannonSavedPos.y, cannonSavedPos.z);
        else
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(boatGroup.position.x - (boatGroup.scale.x / 2) - 2, boatGroup.scale.y + 2.88, boatGroup.scale.z + 3);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).rotation.set(0, 0, Math.PI / 2);
    }
    console.log('cannonTeam : ', boatGroup.getObjectByName(`cannonTeam${teamId}`).position);
    
    // Créer la hitbox pour les collisions
    const boundingBox = new THREE.Box3().setFromObject(bateau);
    // boatGroup.userData.hitbox = {
    //     min: {
    //         x: boundingBox.min.x + 7,
    //         y: boundingBox.min.y + (teamId === 1 ? 2 : 0),
    //         z: boundingBox.min.z
    //     },
    //     max: {
    //         x: boundingBox.max.x,
    //         y: boundingBox.max.y - (teamId === 2 ? 2 : 0),
    //         z: boundingBox.max.z / 3
    //     }
    // };

    boatGroup.userData.hitbox = {
        min: {
            x: boundingBox.min.x + 7,
            y: boundingBox.min.y + 1,
            z: boundingBox.min.z
        },
        max: {
            x: boundingBox.max.x + (teamId === 1 ? 2 : -2),
            y: boundingBox.max.y - 1,
            z: boundingBox.max.z / 3
        }
    };

    return boatGroup;
}

function showBoundingBox(object, scene) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const helper = new THREE.Box3Helper(boundingBox, 0xffff00);
    scene.add(helper);
}

export function createCannonBall() {
    // Créer la géométrie sphérique pour le boulet
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);

    // Créer une texture procédurale
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Créer le gradient radial pour la texture métallique
    const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );

    // Ajouter les couleurs pour un effet métallique usé
    gradient.addColorStop(0, '#4a4a4a');     // Centre plus clair
    gradient.addColorStop(0.4, '#333333');    // Transition
    gradient.addColorStop(0.7, '#222222');    // Extérieur plus sombre
    gradient.addColorStop(1, '#111111');      // Bord très sombre

    // Appliquer le gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Ajouter des effets de texture (rayures et imperfections)
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const brightness = Math.random() * 30 - 15;
        
        context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
        context.fillRect(x, y, 2, 2);
    }

    // Créer la texture Three.js à partir du canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // Créer le matériau avec la texture
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.8,
        roughness: 0.4,
        bumpMap: texture,
        bumpScale: 0.02,
        normalMap: texture,
        normalScale: new THREE.Vector2(0.1, 0.1)
    });

    // Créer le mesh final
    const cannonBall = new THREE.Mesh(geometry, material);

    // Ajouter des ombres
    cannonBall.castShadow = true;
    cannonBall.receiveShadow = true;

    return cannonBall;
}