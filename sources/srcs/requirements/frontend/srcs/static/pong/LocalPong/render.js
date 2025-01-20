import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export async function initScene(Team1, Team2, currentTeam) {
    const scene = new THREE.Scene();
    const cameraPlayer = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraPlayer.position.set(0, 0, 50);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(0, 20, 10);
    directionalLight2.position.set(0, -20, 10);
    
    // Fond océan
    const oceanColor = 0x1E90FF;
    scene.background = new THREE.Color(oceanColor);

    // Initialisation des objets
    const {boatGroup1, boatGroup2, ocean, ball, boundaries} = await initObjects(scene);
    
    // Ajout des éléments à la scène
    scene.add(ambientLight);
    scene.add(directionalLight1);
    scene.add(directionalLight2);
    scene.add(ocean);
    scene.add(boatGroup1);
    scene.add(boatGroup2);
    scene.add(ball);
    scene.add(boundaries);

    const display = [ocean, ambientLight, directionalLight1, directionalLight2];
    return { scene, cameraPlayer, renderer, boatGroup1, boatGroup2, ball, display };
}

async function initObjects(scene) {
    const ocean = createOcean();
    const GLTFloader = new GLTFLoader();
    const {boatGroup1, boatGroup2} = await createBoats();
    const ball = createBall();
    const boundaries = createBoundaries();

    return {boatGroup1, boatGroup2, ocean, ball, boundaries};
}

function createBall() {
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        shininess: 100,
        specular: 0xffffff
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, 0);
    return ball;
}

function createOcean() {
    // Création d'un plan avec une grille pour simuler l'océan
    const oceanGeometry = new THREE.PlaneGeometry(250, 250, 50, 50);
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.8,
        specular: 0x004966,
        shininess: 50,
        flatShading: true
    });

    // Ajouter des ondulations au plan
    const vertices = oceanGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] / 10) * 0.5 + Math.cos(vertices[i + 1] / 10) * 0.5;
    }

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    // ocean.rotation.x = -Math.PI / 2;
    ocean.position.z = 0;

    return ocean;
}

function createBoundaries() {
    const boundariesGroup = new THREE.Group();

    // Matériau pour les bordures principales
    const mainBoundaryMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        specular: 0x222222,
        shininess: 30
    });

    // Matériau pour les décorations
    const decorationMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFD700,
        specular: 0xFFFFFF,
        shininess: 100
    });

    // Création des bordures principales
    function createMainBoundary(x) {
        const geometry = new THREE.BoxGeometry(2, 100, 4);
        const boundary = new THREE.Mesh(geometry, mainBoundaryMaterial);
        boundary.position.set(x, 0, 0);
        
        // Ajouter des décorations
        for (let i = -40; i <= 40; i += 20) {
            // Poteau décoratif
            const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
            const post = new THREE.Mesh(postGeometry, decorationMaterial);
            post.rotation.z = Math.PI / 2;
            post.position.set(x > 0 ? -1 : 1, i, 2);
            boundary.add(post);

            // Sphère décorative sur le poteau
            const sphereGeometry = new THREE.SphereGeometry(0.6, 8, 8);
            const sphere = new THREE.Mesh(sphereGeometry, decorationMaterial);
            sphere.position.set(x > 0 ? -1 : 1, i, 4);
            boundary.add(sphere);
        }

        return boundary;
    }

    // Créer les deux bordures
    const leftBoundary = createMainBoundary(80);
    const rightBoundary = createMainBoundary(-80);

    boundariesGroup.add(leftBoundary);
    boundariesGroup.add(rightBoundary);

    return boundariesGroup;
}

async function createBoats() {
    return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('../../../static/pong/assets/textures/');
        
        mtlLoader.load('onepiece.mtl', function(materials) {
            materials.preload();
            
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('../../../static/pong/assets/models/');
            
            objLoader.load('onepiece.obj', function(object) {
                // Création du bateau 1
                const boat1 = object.clone();
                boat1.scale.set(10, 5, 5);
                boat1.position.set(0, 35, -3);
                boat1.rotation.set(Math.PI / 2, 0, 0);
                boat1.name = 'bateauTeam1';
                
                // Création du bateau 2
                const boat2 = object.clone();
                boat2.scale.set(10, 5, 5);
                boat2.position.set(0, -35, -3);
                boat2.rotation.set(Math.PI / 2, 0, 0);
                boat2.name = 'bateauTeam2';

                // Création des groupes de bateaux
                const boatGroup1 = new THREE.Group();
                const boatGroup2 = new THREE.Group();
                boatGroup1.add(boat1);
                boatGroup2.add(boat2);

                resolve({ boatGroup1, boatGroup2 });
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

export function unloadScene(scene, renderer) {
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
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }
} 