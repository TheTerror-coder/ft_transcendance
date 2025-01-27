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
    
    canvas.width = 2048;
    canvas.height = 2048;
    
    context.font = 'Bold 120px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(1, 1);
    const textMesh = new THREE.Mesh(geometry, material);
    
    // Échelle adaptative
    const scale = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    textMesh.scale.set(scale, scale, 1);
    textMesh.position.set(0, 0, -10);
    
    // Gestionnaire de redimensionnement
    window.addEventListener('resize', () => {
        const newScale = Math.min(window.innerWidth, window.innerHeight) * 0.3;
        textMesh.scale.set(newScale, newScale, 1);
    });

    async function updateEndGameText(isWinner, currentLanguage) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        let text = isWinner ? 
            (currentLanguage === 'fr' ? 'VICTOIRE !' : 
             currentLanguage === 'es' ? 'VICTORIA !' : 'VICTORY !') :
            (currentLanguage === 'fr' ? 'DÉFAITE...' : 
             currentLanguage === 'es' ? 'DERROTA...' : 'DEFEAT...');
        
        context.fillText(text, canvas.width/2, canvas.height/2);
        texture.needsUpdate = true;
    }
    
    return {
        textMesh,
        updateEndGameText
    };
}

function createHealthBar(sx, sy, sz, x, y, z, isEnemyTeam = false) {
    const healthGroup = new THREE.Group();

    // Ajuster la taille en fonction du type de barre
    const width = isEnemyTeam ? 300 : 100;  // Barre ennemie plus large
    const height = isEnemyTeam ? 20 : 10;   // Barre ennemie plus haute

    // Créer le fond de la barre (rouge foncé)
    const backgroundGeometry = new THREE.PlaneGeometry(width, height);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: isEnemyTeam ? 0x800000 : 0x660000,  // Rouge plus foncé pour l'ennemi
        side: THREE.DoubleSide
    });
    const backgroundBar = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    healthGroup.add(backgroundBar);

    // Créer la barre de vie (rouge vif pour ennemi, vert pour allié)
    const healthGeometry = new THREE.PlaneGeometry(width, height);
    const healthMaterial = new THREE.MeshBasicMaterial({
        color: isEnemyTeam ? 0xff0000 : 0x00ff00,
        side: THREE.DoubleSide
    });
    const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
    healthGroup.add(healthBar);

    function updateHealth(percentage) {
        healthBar.scale.x = Math.max(0, Math.min(1, percentage / 100));
        healthBar.position.x = -(width/2) * (1 - healthBar.scale.x);
    }

    healthGroup.position.set(x, y, z);
    healthGroup.scale.set(sx, sy, sz);

    return {
        group: healthGroup,
        updateHealth: updateHealth
    };
}

export async function createHUD(renderer) {
    const hudScene = new THREE.Scene();
    const hudCamera = new THREE.OrthographicCamera(
        -window.innerWidth/2, window.innerWidth/2,
        window.innerHeight/2, -window.innerHeight/2,
        0, 30
    );

    // Score text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;
    
    context.font = 'Bold 80px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('0 - 0', canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(1, 1);
    const textMesh = new THREE.Mesh(geometry, material);
    
    // Ajuster la taille en fonction de la fenêtre
    const scale = Math.min(window.innerWidth, window.innerHeight) * 0.5;
    textMesh.scale.set(scale, scale, 1);
    textMesh.position.set(0, window.innerHeight/2 - 25, 0);
    hudScene.add(textMesh);

    function updateScore(score1, score2) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText(`${score1} - ${score2}`, canvas.width/2, canvas.height/2);
        texture.needsUpdate = true;
    }

    window.addEventListener('resize', () => {
        hudCamera.left = -window.innerWidth/2;
        hudCamera.right = window.innerWidth/2;
        hudCamera.top = window.innerHeight/2;
        hudCamera.bottom = -window.innerHeight/2;
        hudCamera.updateProjectionMatrix();

        const newScale = Math.min(window.innerWidth, window.innerHeight) * 0.1;
        textMesh.scale.set(newScale, newScale, 1);
        textMesh.position.set(0, window.innerHeight/2 - 25, 0);
    });

    // Ajout des barres de vie
    const YourTeamHealthBar = createHealthBar(
        0.5, 0.5, 1,
        -window.innerWidth/2 + 50,  // Position X (gauche)
        -window.innerHeight/2 + 30,  // Position Y (bas)
        0,                          // Position Z
        false                       // Barre alliée (petite)
    );
    const OpponentTeamHealthBar = createHealthBar(
        1.0, 1.0, 1,               // Plus grande échelle
        0,                         // Position X (centre)
        window.innerHeight/2 - 50,  // Position Y (haut)
        0,                         // Position Z
        true                       // Barre ennemie (grande)
    );

    hudScene.add(YourTeamHealthBar.group);
    hudScene.add(OpponentTeamHealthBar.group);

    // Modifier aussi le gestionnaire de redimensionnement
    window.addEventListener('resize', () => {
        // Mise à jour des positions des barres de vie
        YourTeamHealthBar.group.position.set(
            -window.innerWidth/2 + 50,
            -window.innerHeight/2 + 30,
            0
        );
        OpponentTeamHealthBar.group.position.set(
            0,
            window.innerHeight/2 - 50,
            0
        );
    });

    return {
        scene: hudScene,
        camera: hudCamera,
        updateScore,
        updateYourTeamHealth: YourTeamHealthBar.updateHealth,
        updateOpponentTeamHealth: OpponentTeamHealthBar.updateHealth
    };
}