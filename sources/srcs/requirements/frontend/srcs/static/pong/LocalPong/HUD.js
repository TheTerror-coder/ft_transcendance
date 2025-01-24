import * as THREE from 'three';

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
    
    context.font = 'Bold 40px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('0 - 0', canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(10, 10);
    const textMesh = new THREE.Mesh(geometry, material);

    // End game text
    const endGameCanvas = document.createElement('canvas');
    const endGameContext = endGameCanvas.getContext('2d');
    endGameCanvas.width = 2048;
    endGameCanvas.height = 2048;
    
    const endGameTexture = new THREE.CanvasTexture(endGameCanvas);
    const endGameMaterial = new THREE.MeshBasicMaterial({
        map: endGameTexture,
        transparent: true
    });
    
    const endGameGeometry = new THREE.PlaneGeometry(20, 20);
    const endGameMesh = new THREE.Mesh(endGameGeometry, endGameMaterial);
    endGameMesh.scale.set(200, 200, 200);
    endGameMesh.position.set(0, 0, -10);
    
    function updateScore(score1, score2) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText(`${score1} - ${score2}`, canvas.width/2, canvas.height/2);
        texture.needsUpdate = true;
    }

    function showEndGameText(isWinner, currentLanguage) {
        endGameContext.clearRect(0, 0, endGameCanvas.width, endGameCanvas.height);
        endGameContext.font = 'Bold 120px Arial';
        endGameContext.fillStyle = 'white';
        endGameContext.textAlign = 'center';
        endGameContext.textBaseline = 'middle';

        let text = isWinner ? 
            (currentLanguage === 'fr' ? 'VICTOIRE !' : 'VICTORY !') :
            (currentLanguage === 'fr' ? 'DÉFAITE...' : 'DEFEAT...');
        
        endGameContext.fillText(text, endGameCanvas.width/2, endGameCanvas.height/2);
        endGameTexture.needsUpdate = true;
        hudScene.add(endGameMesh);
    }

    textMesh.position.set(0, window.innerHeight/2 - 50, 0);
    textMesh.scale.set(100, 100, 100);
    hudScene.add(textMesh);

    window.addEventListener('resize', () => {
        hudCamera.left = -window.innerWidth/2;
        hudCamera.right = window.innerWidth/2;
        hudCamera.top = window.innerHeight/2;
        hudCamera.bottom = -window.innerHeight/2;
        hudCamera.updateProjectionMatrix();
        textMesh.position.set(0, window.innerHeight/2 - 50, 0);
    });

    return {
        scene: hudScene,
        camera: hudCamera,
        updateScore,
        showEndGameText
    };
} 