import * as THREE from 'three';

class Team
{
    constructor(name, nbPlayer, TeamId)
    {
        this.TeamId = TeamId;
        this.name = name;
        this.nbPlayer = 0;
        this.maxNbPlayer = nbPlayer;
        this.player = new Map();
        this.boat = null;
        this.cannon = null;
        this.isFull = false;
        this.score = 0;
    }

    setCameraPosForAllPlayers(x, y, z)
    {
        for (const player of this.player.values())
        {
            console.log('Player : ', player);
            player.setCameraPos(x, y, z);
            console.log('Player camera pos : ', player.getCameraPos());
        }
    }

    setScore(score)
    {
        this.score = score;
        // console.log('Team', this.TeamId, 'score : ', this.score);
    }

    getScore()
    {
        return (this.score);
    }

    setIsFull()
    {
        this.isFull = this.nbPlayer >= this.maxNbPlayer;
    }

    getIsFull()
    {
        return (this.isFull);
    }

    setPlayer(player)
    {
        if (this.getIsFull())
        {
            console.log("This Team is already full...");
            return;
        }
        this.player.set(player.id, player);
        this.nbPlayer++;
        this.setIsFull();
    }

    setTeamName(name)
    {
        this.name = name;
    }

    setBoat(boat)
    {
        this.boat = boat;
    }

    setCannon(cannon)
    {
        this.cannon = cannon;
    }

    removePlayer(id)
    {
        this.player.delete(id);
        this.nbPlayer--;
    }

    getTeamId()
    {
        return (this.TeamId);
    }

    getBoatGroup()
    {
        if (!this.boat) {
            console.error('Boat is not set for team', this.TeamId);
            return null;
        }
        return this.boat;
    }

    getBoat()
    {
        return this.boat.getObjectByName(`bateauTeam${this.TeamId}`);
    }

    getCannon() {
        if (!this.boat) {
            console.error('Boat is not set for team', this.TeamId);
            return null;
        }
        const cannon = this.boat.getObjectByName(`cannonTeam${this.TeamId}`);
        if (!cannon) {
            console.error('Cannon not found for team', this.TeamId);
        }
        return cannon;
    }

    getCannonTubeGroupPosition()
    {
        const worldTubePos = new THREE.Vector3();
        const cannonTube = this.getCannonTubeGroup();
        
        // Obtenir la position de base du canon dans le monde
        cannonTube.getWorldPosition(worldTubePos);
        
        return worldTubePos;
    }
    
    getCannonPosInTheWorld()
    {
        const worldCannonPos = new THREE.Vector3();
        const cannon = this.getCannon();
        cannon.getWorldPosition(worldCannonPos);
        return worldCannonPos;
    }

    getCannonTubeLengthFromPivot() {
        const cannonTubeGroup = this.getCannonTubeGroup();
        if (!cannonTubeGroup) return 0;

        const tube = this.getCannonTube();
        if (!tube) return 0;

        // Mettre à jour la matrice monde
        cannonTubeGroup.updateMatrixWorld(true);
        tube.updateMatrixWorld(true);

        // Obtenir la boîte englobante du tube
        const tubeBoundingBox = new THREE.Box3().setFromObject(tube);
        const tubeLength = tubeBoundingBox.max.y - tubeBoundingBox.min.y;

        // Créer un vecteur pour le bout du canon
        const tipPosition = new THREE.Vector3(0, tubeLength * (this.TeamId === 1 ? -0.5 : 0.5), 0);
        tipPosition.applyMatrix4(tube.matrixWorld);

        return tipPosition;
    }

    // Nouvelle méthode pour obtenir la position exacte du bout du canon
    getCannonTipPosition() {
        const cannonTubeGroup = this.getCannonTubeGroup();
        if (!cannonTubeGroup) return null;

        // Mettre à jour la matrice monde
        cannonTubeGroup.updateMatrixWorld(true);
        const tube = this.getCannonTube();
        if (!tube) return null;

        // Calculer la position du bout du canon
        const tubeLength = this.getCannonTubeLengthFromPivot();
        const directionY = this.TeamId === 1 ? -1 : 1;
        const tipOffset = new THREE.Vector3(0, tubeLength * directionY, 0);
        tipOffset.applyMatrix4(tube.matrixWorld);

        return tipOffset;
    }

    createTubeLengthLine() {
        const cannonTubeGroup = this.getCannonTubeGroup();
        if (!cannonTubeGroup) {
            console.error('Cannon tube group not found for team', this.TeamId);
            return null;
        }
    
        // Position du point de pivot
        const pivotPosition = new THREE.Vector3();
        cannonTubeGroup.getWorldPosition(pivotPosition);
    
        // Créer le point d'arrivée en utilisant la rotation du groupe et la longueur calculée
        const tubeLength = this.getCannonTubeLengthFromPivot();
        const rotation = cannonTubeGroup.rotation;
    
        // Calculer le point d'arrivée
        const endPoint = new THREE.Vector3();
        endPoint.copy(pivotPosition);
        
        // Ajuster la position en fonction de la rotation et de la longueur
        const directionY = this.TeamId === 1 ? -1 : 1;
        endPoint.y += tubeLength * Math.cos(rotation.z) * directionY;
        endPoint.z += tubeLength * Math.sin(rotation.z);
    
        // Créer la ligne
        const points = [pivotPosition, endPoint];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ff00,
            linewidth: 2
        });
    
        return new THREE.Line(geometry, material);
    }

    getCannonTubeGroupRotation()
    {
        const cannonTube = this.getCannonTubeGroup();
        // const box = new THREE.Box3().setFromObject(cannonTube);
        
        // // Calculer les côtés du triangle rectangle
        // const adjacent = this.getCannonTubeLengthFromPivot();  // Distance verticale (y)
        // const oppose = (box.max.z - box.min.z) / 2;    // Distance horizontale (z)
        
        // // Utiliser le théorème de Thalès pour calculer l'angle
        // // tan(θ) = opposé / adjacent
        // const angleY = Math.atan2(oppose, adjacent);

        // console.log('angleY : ', angleY * 180 / Math.PI);
        
        // return angleY;
        return (cannonTube.rotation);
    }

    getCannonTubeGroup()
    {
        return (this.getCannon().getObjectByName(`cannon${this.TeamId}_tube_group`));
    }

    getCannonTube()
    {
        return (this.getCannonTubeGroup().getObjectByName(`cannonTubeTeam${this.TeamId}`));
    }

    getNbPlayer()
    {
        return (this.nbPlayer);
    }

    getAllPlayer()
    {
        return (this.player);
    }

    getPlayerById(id)
    {
        return (this.player.get(id));
    }

    getPlayerByName(name)
    {
        for (const player of this.player.values())
        {
            if (player.name === name)
                return (player);
        }
        return (null);
    }

    getPlayerMap()
    {
        return (this.player);
    }

    getName()
    {
        return (this.name);
    }
}

export default Team;
