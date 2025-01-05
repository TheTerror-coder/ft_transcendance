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
    // Créer un canvas temporaire pour le texte
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Définir la taille du canvas
    canvas.width = 1024;
    canvas.height = 1024;
    
    // Configurer le style du texte
    context.font = 'Bold 40px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Écrire le texte
    context.fillText('Score team 1: 0 - Score team 2: 0', canvas.width / 2, canvas.height / 2);
    
    // Créer une texture à partir du canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Créer un matériau avec la texture
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    
    // Créer un plan pour afficher le texte
    const geometry = new THREE.PlaneGeometry(10, 10);
    const textMesh = new THREE.Mesh(geometry, material);

    // Pour mettre à jour le texte :
    function updateHUDText(text) {
        const canvas = textMesh.material.map.image;
        const context = canvas.getContext('2d');
        
        // Effacer le canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Écrire le nouveau texte
        context.fillText(text, canvas.width/2, canvas.height/2);
        
        // Indiquer que la texture doit être mise à jour
        textMesh.material.map.needsUpdate = true;
    }

    // Positionner le texte en haut à droite
    const scoreTextMargin = 50; // marge depuis les bords
    textMesh.position.set(
        0,
        window.innerHeight - scoreTextMargin,
        0
    );

    textMesh.scale.set(100, 100, 100);
    
    return {
        textMesh: textMesh,
        updateHUDText: updateHUDText
    };
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
    
    async function updateEndGameText(isWinner) {
        const canvas = textMesh.material.map.image;
        const context = canvas.getContext('2d');
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isWinner)
            await context.fillText('VICTOIRE !', canvas.width/2, canvas.height/2);
        else
            await context.fillText('DÉFAITE...', canvas.width/2, canvas.height/2);
        
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
    // Créer une scène et une caméra orthographique pour le HUD
    const hudScene = new THREE.Scene();
    const hudCamera = new THREE.OrthographicCamera(
        -window.innerWidth, window.innerWidth,
        window.innerHeight, -window.innerHeight,
        0, 30
    );

    // Créer le cercle de chargement
    const loadingCircle = createLoadingCircle();

    // Positionner le cercle en haut à droite
    const circleMargin = 50; // marge depuis les bords
    loadingCircle.group.position.set(
        window.innerWidth - circleMargin,
        window.innerHeight - circleMargin,
        0
    );

    // Créer le texte
    const scoreText = createScoreText();
    hudScene.add(scoreText.textMesh);

    // Créer la barre de vie
    const healthBar = createHealthBar(10, 5, 5, 0, window.innerHeight - 100, 0);
    const healthBar2 = createHealthBar(1, 1, 1, -window.innerWidth, window.innerHeight - 200, 0);
    hudScene.add(healthBar.group);
    hudScene.add(healthBar2.group);

    // Créer le texte de fin de partie
    const endGameText = await createEndGameText();

    // Fonction pour redimensionner le HUD
    function onWindowResize() {
        hudCamera.left = -window.innerWidth/2;
        hudCamera.right = window.innerWidth/2;
        hudCamera.top = window.innerHeight/2;
        hudCamera.bottom = -window.innerHeight/2;
        hudCamera.updateProjectionMatrix();

        // Mettre à jour la position du cercle
        loadingCircle.group.position.set(
            window.innerWidth - circleMargin,
            window.innerHeight - circleMargin,
            0
        );

        // Mettre à jour la position du texte
        const scoreTextMargin = 50; // marge depuis les bords
        scoreText.textMesh.position.set(
            0,
            window.innerHeight - scoreTextMargin,
            0
        );

        healthBar.group.position.set(
            -window.innerWidth/2 + 100,
            window.innerHeight/2 - 30,
            0
        );
    }

    function getPercentage(keys, key)
    {
        const percentage = Math.min((keys[key].time / 10000) * 100, 100);
        loadingCircle.updateProgress(percentage);
        if (percentage >= 100)
        {
            hudScene.remove(loadingCircle.group);
            loadingCircle.updateProgress(0);
            return percentage;
        }
    }

    window.addEventListener('resize', onWindowResize);

    return {
        scene: hudScene,
        camera: hudCamera,
        loadingCircle: loadingCircle,
        getPercentage: getPercentage,
        scoreText: scoreText,
        updateHUDText: scoreText.updateHUDText,
        endGameText: endGameText,
        showEndGameText: (isWinner) => {
            hudScene.add(endGameText.textMesh);
            endGameText.updateEndGameText(isWinner);
        },
        healthBar: healthBar,
        healthBar2 : healthBar2,
        updateHealth: healthBar.updateHealth,
        updateHealth2: healthBar2.updateHealth
    };
}