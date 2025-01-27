import * as THREE from 'three';

function createLoadingCircle() {
    // Créer un groupe pour contenir le cercle
    const circleGroup = new THREE.Group();

    // Créer le cercle de fond (gris)
    const backgroundGeometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI / 2);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide
    });
    const backgroundCircle = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    circleGroup.add(backgroundCircle);

    // Créer le cercle de progression
    const progressGeometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI / 2, 0);
    const progressMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    const progressCircle = new THREE.Mesh(progressGeometry, progressMaterial);
    circleGroup.add(progressCircle);

    // Fonction pour mettre à jour la progression
    function updateProgress(percent) {
        const angle = (percent / 100) * Math.PI * 2;
        progressCircle.geometry.dispose();
        progressCircle.geometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI, -angle);
    }

    circleGroup.scale.set(20, 20, 20);

    return {
        group: circleGroup,
        updateProgress: updateProgress
    };
}

function createScoreText() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 1024;
    canvas.height = 1024;
    
    context.font = 'Bold 80px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    
    // Ajuster la taille en fonction de la fenêtre
    const scale = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    mesh.scale.set(scale, scale, 1);
    
    return { mesh, context, texture };
}

async function createEndGameText() {

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 2048;  // Augmenter la taille du canvas
    canvas.height = 2048;
    
    // Configurer le style du texte
    context.font = 'Bold 120px Arial';  // Augmenter la taille de la police
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(20, 20);  // Augmenter la taille du plan
    const textMesh = new THREE.Mesh(geometry, material);
    
    async function updateEndGameText(isWinner, currentLanguage) {
        const canvas = textMesh.material.map.image;
        const context = canvas.getContext('2d');
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        let winText = "VICTORY !";
        let loseText = "DEFEAT...";
        console.log("currentLanguage: ", currentLanguage);

        if (currentLanguage === 'en')
        {
            winText = "VICTORY !";
            loseText = "DEFEAT...";
        }
        else if (currentLanguage === 'fr')
        {
            winText = "VICTOIRE !";
            loseText = "DÉFAITE...";
        }
        else if (currentLanguage === 'es')
        {
            winText = "VICTORIA !";
            loseText = "DERROTA...";
        }

        if (isWinner)
            await context.fillText(winText, canvas.width/2, canvas.height/2);
        else
            await context.fillText(loseText, canvas.width/2, canvas.height/2);
        
        textMesh.material.map.needsUpdate = true;
    }

    // Positionner le texte au centre et plus proche de la caméra
    textMesh.position.set(0, 0, -10);
    textMesh.scale.set(200, 200, 200);
    
    return {
        textMesh: textMesh,
        updateEndGameText: updateEndGameText
    };
}

function createHealthBar(sx, sy, sz, x, y, z) {
    // Créer un groupe pour contenir la barre de vie
    const healthGroup = new THREE.Group();

    // Créer le fond de la barre (rouge)
    const backgroundGeometry = new THREE.PlaneGeometry(100, 10);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide
    });
    const backgroundBar = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    healthGroup.add(backgroundBar);

    // Créer la barre de vie (verte)
    const healthGeometry = new THREE.PlaneGeometry(100, 10);
    const healthMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
    healthGroup.add(healthBar);

    // Fonction pour mettre à jour la barre de vie
    function updateHealth(percentage) {
        healthBar.scale.x = Math.max(0, Math.min(1, percentage / 100));
        healthBar.position.x = -50 * (1 - healthBar.scale.x);
    }

    // Positionner la barre en haut à gauche
    healthGroup.position.set(
        x,
        y,
        z
    );

    healthGroup.scale.set(sx, sy, sz);

    return {
        group: healthGroup,
        updateHealth: updateHealth
    };
}

export async function createHUD(renderer) {
    const hudScene = new THREE.Scene();
    const hudCamera = new THREE.OrthographicCamera(
        -window.innerWidth / 2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        -window.innerHeight / 2,
        0,
        30
    );

    const scoreText = createScoreText();
    const scoreTextMargin = 50 * (window.innerHeight / 1080); // Marge adaptative
    scoreText.mesh.position.set(0, window.innerHeight/2 - scoreTextMargin, 0);
    hudScene.add(scoreText.mesh);

    // Gestionnaire de redimensionnement
    window.addEventListener('resize', () => {
        // Mettre à jour la caméra
        hudCamera.left = -window.innerWidth / 2;
        hudCamera.right = window.innerWidth / 2;
        hudCamera.top = window.innerHeight / 2;
        hudCamera.bottom = -window.innerHeight / 2;
        hudCamera.updateProjectionMatrix();

        // Mettre à jour la taille du score
        const newScale = Math.min(window.innerWidth, window.innerHeight) * 0.1;
        scoreText.mesh.scale.set(newScale, newScale, 1);
        
        // Mettre à jour la position du score
        const newMargin = 50 * (window.innerHeight / 1080);
        scoreText.mesh.position.set(0, window.innerHeight/2 - newMargin, 0);

        // Mettre à jour le renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function updateScore(team1Score, team2Score) {
        scoreText.context.clearRect(0, 0, 1024, 1024);
        scoreText.context.fillText(`${team1Score} - ${team2Score}`, 512, 512);
        scoreText.texture.needsUpdate = true;
    }

    function showEndGameText(isWinner, currentLanguage) {
        const endGameCanvas = document.createElement('canvas');
        const context = endGameCanvas.getContext('2d');
        endGameCanvas.width = 2048;
        endGameCanvas.height = 2048;

        context.font = 'Bold 160px Arial';
        context.fillStyle = isWinner ? '#00ff00' : '#ff0000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const text = isWinner ? 
            (currentLanguage === 'fr' ? 'VICTOIRE !' : 'VICTORY !') :
            (currentLanguage === 'fr' ? 'DÉFAITE...' : 'DEFEAT...');

        context.fillText(text, 1024, 1024);

        const texture = new THREE.CanvasTexture(endGameCanvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);

        // Taille adaptative pour le texte de fin
        const scale = Math.min(window.innerWidth, window.innerHeight) * 0.3;
        mesh.scale.set(scale, scale, 1);
        mesh.position.set(0, 0, 0);

        hudScene.add(mesh);
    }

    return {
        scene: hudScene,
        camera: hudCamera,
        updateScore,
        showEndGameText
    };
}