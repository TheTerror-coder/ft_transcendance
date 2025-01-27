import * as THREE from 'three';

function createLoadingCircle() {
    const circleGroup = new THREE.Group();

    const backgroundGeometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI / 2);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide
    });
    const backgroundCircle = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    circleGroup.add(backgroundCircle);

    const progressGeometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI / 2, 0);
    const progressMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    const progressCircle = new THREE.Mesh(progressGeometry, progressMaterial);
    circleGroup.add(progressCircle);

    // Adapter la taille initiale
    const scale = Math.min(window.innerWidth, window.innerHeight) * 0.01;
    circleGroup.scale.set(scale, scale, scale);

    let currentPercent = 0;
    let animationId = null;
    const MAX_CHARGE_TIME = 5000; // 5 secondes pour charge complète

    function updateProgress(pressTime) {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
        }

        const targetPercent = Math.min(100, (pressTime / MAX_CHARGE_TIME) * 100);
        
        function animate() {
            if (Math.abs(currentPercent - targetPercent) < 0.5) {
                currentPercent = targetPercent;
                const angle = (currentPercent / 100) * Math.PI * 2;
                progressCircle.geometry.dispose();
                progressCircle.geometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI, -angle);
                animationId = null;
                return;
            }

            currentPercent += (targetPercent - currentPercent) * 0.1;
            const angle = (currentPercent / 100) * Math.PI * 2;
            progressCircle.geometry.dispose();
            progressCircle.geometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI, -angle);
            
            animationId = requestAnimationFrame(animate);
        }

        animate();
    }

    function getPourcentage(keys) {
        if (keys && keys['r'] && keys['r'].pressed) {
            updateProgress(keys['r'].time);
        }
        return currentPercent;
    }

    function resetProgress() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
        }
        currentPercent = 0;
        const angle = 0;
        progressCircle.geometry.dispose();
        progressCircle.geometry = new THREE.RingGeometry(1, 1.5, 32, 1, Math.PI, -angle);
    }

    return {
        group: circleGroup,
        getPourcentage,
        resetProgress,
        updateSize: () => {
            const newScale = Math.min(window.innerWidth, window.innerHeight) * 0.01;
            circleGroup.scale.set(newScale, newScale, newScale);
        }
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
    const scale = Math.min(window.innerWidth, window.innerHeight) * 1.5;
    textMesh.scale.set(scale, scale, 1);
    textMesh.position.set(0, 0, 0);
    
    // Gestionnaire de redimensionnement
    window.addEventListener('resize', () => {
        const newScale = Math.min(window.innerWidth, window.innerHeight) * 1.5;
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

    // Créer le texte de fin de partie
    const endGameTextObject = await createEndGameText();
    hudScene.add(endGameTextObject.textMesh);
    endGameTextObject.textMesh.visible = false;  // Caché par défaut

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

    // Ajouter le cercle de chargement
    const loadingCircle = createLoadingCircle();
    loadingCircle.group.position.set(
        window.innerWidth/2 - 50,  // Décalage de 50 pixels du bord droit
        window.innerHeight/2 - 50,  // Décalage de 50 pixels du bord supérieur
        0
    );
    hudScene.add(loadingCircle.group);
    loadingCircle.group.visible = false;

    // Ajout des barres de vie
    const YourTeamHealthBar = createHealthBar(
        0.5, 0.5, 1,
        -window.innerWidth/2 + 50,  // Position X (gauche)
        window.innerHeight/2 - 30,  // Position Y (Haut)
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

    // Modifier le gestionnaire de redimensionnement
    window.addEventListener('resize', () => {
        hudCamera.left = -window.innerWidth/2;
        hudCamera.right = window.innerWidth/2;
        hudCamera.top = window.innerHeight/2;
        hudCamera.bottom = -window.innerHeight/2;
        hudCamera.updateProjectionMatrix();

        // Mettre à jour la taille du score
        const newScaleScore = Math.min(window.innerWidth, window.innerHeight) * 0.5; // Augmenté pour une meilleure visibilité
        textMesh.scale.set(newScaleScore, newScaleScore, 1);
        textMesh.position.set(0, window.innerHeight/2 - 25, 0);

        // Mettre à jour la taille du cercle de chargement
        loadingCircle.updateSize();

        // Mise à jour des positions des barres de vie
        YourTeamHealthBar.group.position.set(
            -window.innerWidth/2 + 50,
            window.innerHeight/2 - 30,
            0
        );
        OpponentTeamHealthBar.group.position.set(
            0,
            window.innerHeight/2 - 50,
            0
        );

        // Mettre à jour la position du cercle de chargement
        loadingCircle.group.position.set(
            window.innerWidth/2 - 50,
            window.innerHeight/2 - 50,
            0
        );
    });

    return {
        scene: hudScene,
        camera: hudCamera,
        updateScore,
        updateYourTeamHealth: YourTeamHealthBar.updateHealth,
        updateOpponentTeamHealth: OpponentTeamHealthBar.updateHealth,
        showEndGameText: async (isWinner, currentLanguage) => {
            endGameTextObject.textMesh.visible = true;
            await endGameTextObject.updateEndGameText(isWinner, currentLanguage);
        },
        hideEndGameText: () => {
            endGameTextObject.textMesh.visible = false;
        },
        showLoadingCircle: () => {
            loadingCircle.group.visible = true;
        },
        hideLoadingCircle: () => {
            loadingCircle.group.visible = false;
            loadingCircle.resetProgress();
        },
        getLoadingProgress: (keys) => {
            return loadingCircle.getPourcentage(keys);
        },
        resetProgress: () => {
            loadingCircle.resetProgress();
        }
    };
}