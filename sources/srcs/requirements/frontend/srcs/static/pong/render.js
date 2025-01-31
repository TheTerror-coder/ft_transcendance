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
    
    const fogColor = new THREE.Color(0x1E90FF);
    scene.fog = new THREE.Fog(fogColor, 100, 300);
    
    const oceanColor = 0x1E90FF;
    scene.background = new THREE.Color(oceanColor);
    let {boatGroup1, boatGroup2, ocean, ball} = await initObject(scene, Team1, Team2, currentTeam);
    await loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, boatGroup1, boatGroup2);
    if (!loadScene)
        return (false);
    let display = [ocean, ambientLight, directionalLight1, directionalLight2];
    return { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display };
}

function initBoundaryLines() {
    const material = new THREE.LineBasicMaterial({ color: 0xFF69B4 }); // Rose
    const lines = new THREE.Group();

    const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-80, -55, 0),
        new THREE.Vector3(-80, 55, 0)
    ]);
    const verticalLine1 = new THREE.Line(verticalGeometry, material);
    const verticalLine2 = new THREE.Line(verticalGeometry.clone(), material);
    verticalLine2.position.x = 160;

    const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-80, -55, 0),
        new THREE.Vector3(80, -55, 0)
    ]);
    const horizontalLine1 = new THREE.Line(horizontalGeometry, material);
    const horizontalLine2 = new THREE.Line(horizontalGeometry.clone(), material);
    horizontalLine2.position.y = 110;

    lines.add(verticalLine1);
    lines.add(verticalLine2);
    lines.add(horizontalLine1);
    lines.add(horizontalLine2);

    return lines;
}

async function loadScene(ball, ocean, scene, ambientLight, directionalLight1, directionalLight2, bateau1, bateau2) {
    return new Promise((resolve, reject) => {
        
        try {
            if (!ball || !ocean || !ambientLight || !directionalLight1 || !directionalLight2 || !bateau1 || !bateau2) {
                reject(new Error('Error: One or more elements are missing'));
                return;
            }

            scene.add(ball);
            scene.add(ocean);
            scene.add(ambientLight);
            scene.add(directionalLight1);
            scene.add(directionalLight2);
            scene.add(bateau1);
            scene.add(bateau2);

            const elements = [
                { name: 'Balle', obj: ball },
                { name: 'Océan', obj: ocean },
                { name: 'Bateau 1', obj: bateau1 },
                { name: 'Bateau 2', obj: bateau2 }
            ];

            const invisibleElements = elements.filter(el => !el.obj.visible);
            if (invisibleElements.length > 0) {
                reject(new Error(`Error: Elements not visible: ${invisibleElements.map(el => el.name).join(', ')}`));
                return;
            }

            const sceneElements = scene.children;
            const allElementsInScene = elements.every(el => 
                sceneElements.includes(el.obj)
            );

            if (!allElementsInScene) {
                reject(new Error('Error: Elements not in scene'));
                return;
            }

            resolve(true);
        } catch (error) {
            console.error('❌ Error loading the scene:', error);
            reject(error);
        }
    });
}

export function unloadScene(ball, scene, bateau1, bateau2, display, renderer) {
    if (ball) {
        scene.remove(ball);
        if (ball.geometry) ball.geometry.dispose();
        if (ball.material) ball.material.dispose();
    }

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

    if (display) {
        for (const item of display) {
            if (item) {
                scene.remove(item);
                if (item.geometry) item.geometry.dispose();
                if (item.material) item.material.dispose();
            }
        }
    }

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

    if (renderer) {
        renderer.renderLists.dispose();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    scene.clear();

    if (renderer) {
        renderer.render(scene, new THREE.PerspectiveCamera());
    }
}

async function initObject(scene, Team1, Team2, currentTeam)
{
    const gltfLoader = new GLTFLoader();
    gltfLoader.setCrossOrigin('anonymous');
    gltfLoader.setPath('');
    let bateau = await initBateaux(scene);
    let cannonGroup = await initCannons(scene);
    let boatGroup1 = await CreateBoatGroup(scene, bateau.bateauTeam1, cannonGroup.get('cannonTeam1'), 1, Team1.getBoatSavedPos(), Team1.getCannonSavedPos());
    let boatGroup2 = await CreateBoatGroup(scene, bateau.bateauTeam2, cannonGroup.get('cannonTeam2'), 2, Team2.getBoatSavedPos(), Team2.getCannonSavedPos());
    let ocean = createOcean();
    let boundaries = createBoundaries();
    scene.add(boundaries);
    let ball = await initBall(currentTeam.getBallSavedPos());

    return {boatGroup1, boatGroup2, ocean, ball};
}

function initBall(ballSavedPos) {
    return new Promise((resolve, reject) => {
        try {
            const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
            const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
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

async function initBateaux(scene) {
    return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('../../static/pong/assets/textures/');
        
        mtlLoader.load('onepiece.mtl', function(materials) {
            materials.preload();
            
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('../../static/pong/assets/models/');
            
            objLoader.load('onepiece.obj', function(object) {
                const bateauTeam1 = object.clone();
                bateauTeam1.scale.set(10, 5, 5);
                bateauTeam1.rotation.set(Math.PI / 2, 0, 0);
                bateauTeam1.name = 'bateauTeam1';
                
                const bateauTeam2 = object.clone();
                bateauTeam2.scale.set(10, 5, 5);
                bateauTeam2.rotation.set(Math.PI / 2, 0, 0);
                bateauTeam2.name = 'bateauTeam2';

                resolve({ bateauTeam1, bateauTeam2 });
            }, undefined, function(error) {
                console.error('Error loading boat model:', error);
                reject(error);
            });
        }, undefined, function(error) {
            console.error('Error loading boat materials:', error);
            reject(error);
        });
    });
}

function createOcean() {
    const oceanGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.8,
        specular: 0x004966,
        shininess: 50,
        flatShading: true,
        fog: true
    });

    const vertices = oceanGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] / 10) * 0.5 + Math.cos(vertices[i + 1] / 10) * 0.5;
    }

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.position.z = 0;

    return ocean;
}

function createBoundaries() {
    const boundariesGroup = new THREE.Group();

    const mainBoundaryMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        specular: 0x222222,
        shininess: 30
    });

    const decorationMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFD700,
        specular: 0xFFFFFF,
        shininess: 100
    });

    function createMainBoundary(x) {
        const geometry = new THREE.BoxGeometry(2, 100, 4);
        const boundary = new THREE.Mesh(geometry, mainBoundaryMaterial);
        boundary.position.set(x, 0, 0);
        
        for (let i = -40; i <= 40; i += 20) {
            const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
            const post = new THREE.Mesh(postGeometry, decorationMaterial);
            post.rotation.z = Math.PI / 2;
            post.position.set(x > 0 ? -1 : 1, i, 2);
            boundary.add(post);

            const sphereGeometry = new THREE.SphereGeometry(0.6, 8, 8);
            const sphere = new THREE.Mesh(sphereGeometry, decorationMaterial);
            sphere.position.set(x > 0 ? -1 : 1, i, 4);
            boundary.add(sphere);
        }

        return boundary;
    }

    const leftBoundary = createMainBoundary(80);
    const rightBoundary = createMainBoundary(-80);

    boundariesGroup.add(leftBoundary);
    boundariesGroup.add(rightBoundary);

    return boundariesGroup;
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
        MTLloader.load('Juste_Cannon.mtl', function(materials) {
            materials.preload();
            OBJLoader.setMaterials(materials);
            OBJLoader.load('Juste_Cannon.obj', function(object) {
                const cannonTube1 = object.clone();
                const cannonTube2 = object.clone();
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
        
        const tipGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const tipMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        const cannonTip1 = new THREE.Mesh(tipGeometry, tipMaterial);
        const cannonTip2 = new THREE.Mesh(tipGeometry, tipMaterial);
        
        cannonTip1.name = `cannonTipTeam1`;
        cannonTip2.name = `cannonTipTeam2`;
        
        let x = 24;
        let y = 0;
        let z = 50;

        cannonTip1.position.set(115, 0, 60);
        cannonTip2.position.set(115, 0, 60);

        cannonTip1.visible = false;
        cannonTip2.visible = false;

        cannonTube1.add(cannonTip1);
        cannonTube2.add(cannonTip2);

        let cannonTeam1 = new THREE.Group();
        let cannonTeam2 = new THREE.Group();
        let cannon1_tube_group = new THREE.Group();
        let cannon2_tube_group = new THREE.Group();

        cannonTeam1.name = `cannonTeam1`;
        cannonTeam2.name = `cannonTeam2`;
        cannon1_tube_group.name = `cannon1_tube_group`;
        cannon2_tube_group.name = `cannon2_tube_group`;

        cannonTube1.position.set(-x, y, -z);
        cannonTube2.position.set(-x, y, -z);

        cannon1_tube_group.add(cannonTube1);
        cannon2_tube_group.add(cannonTube2);

        cannon1_tube_group.position.set(x, y, z);
        cannon2_tube_group.position.set(x, y, z);

        cannonTeam1.add(cannon1_tube_group);
        cannonTeam2.add(cannon2_tube_group);
        cannonTeam1.add(cannonSupport1);
        cannonTeam2.add(cannonSupport2);
        
        cannonTeam1.scale.set(0.01, 0.03, 0.03);
        cannonTeam2.scale.set(0.01, 0.03, 0.03);

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
    
    if (teamId === 1) {
        if (boatSavedPos.x != 0 && boatSavedPos.y != 0 && boatSavedPos.z != 0)
            boatGroup.position.set(boatSavedPos.x, 35, -2);
        else
            boatGroup.position.set(0, 35, -2);
        if (cannonSavedPos.x != 0 && cannonSavedPos.y != 0 && cannonSavedPos.z != 0)
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(cannonSavedPos.x, boatGroup.scale.y - 3.18, boatGroup.scale.z + 3);
        else
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(boatGroup.position.x - (boatGroup.scale.x / 2) - 2, boatGroup.scale.y - 3.18, boatGroup.scale.z + 3);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).rotation.set(0, 0, -Math.PI / 2);
    } else if (teamId === 2) {
        if (boatSavedPos.x != 0 && boatSavedPos.y != 0 && boatSavedPos.z != 0)
            boatGroup.position.set(boatSavedPos.x, -35, -2);
        else
            boatGroup.position.set(0, -35, -2);
        if (cannonSavedPos.x != 0 && cannonSavedPos.y != 0 && cannonSavedPos.z != 0)
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(cannonSavedPos.x, boatGroup.scale.y + 2.88, boatGroup.scale.z + 3);
        else
            boatGroup.getObjectByName(`cannonTeam${teamId}`).position.set(boatGroup.position.x - (boatGroup.scale.x / 2) - 2, boatGroup.scale.y + 2.88, boatGroup.scale.z + 3);
        boatGroup.getObjectByName(`cannonTeam${teamId}`).rotation.set(0, 0, Math.PI / 2);
    }
    
    const boundingBox = new THREE.Box3().setFromObject(bateau);

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

export function createCannonBall() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );

    gradient.addColorStop(0, '#4a4a4a');
    gradient.addColorStop(0.4, '#333333');
    gradient.addColorStop(0.7, '#222222');
    gradient.addColorStop(1, '#111111');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const brightness = Math.random() * 30 - 15;
        
        context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
        context.fillRect(x, y, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.8,
        roughness: 0.4,
        bumpMap: texture,
        bumpScale: 0.02,
        normalMap: texture,
        normalScale: new THREE.Vector2(0.1, 0.1)
    });

    const cannonBall = new THREE.Mesh(geometry, material);

    cannonBall.castShadow = true;
    cannonBall.receiveShadow = true;

    return cannonBall;
}