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

    getCannonTubePosition()
    {
        const worldTubePos = new THREE.Vector3();
        const cannon = this.getCannon();
        const cannonTube = this.getCannonTube();
        
        // Obtenir la position de base du canon dans le monde
        cannon.getWorldPosition(worldTubePos);
        
        const box = new THREE.Box3().setFromObject(cannonTube);

        // Longueur du tube du canon
        const tubeLength = box.max.y - box.min.y;
        // const tubeHeight = box.max.z - box.min.z;

        // console.log('tubeLength : ', tubeLength);
        // console.log('tubeHeight : ', tubeHeight);
        
        // Obtenir l'angle de rotation sur l'axe Y
        // const angleY = Math.atan(tubeHeight / tubeLength);
        const angleY = -cannonTube.rotation.y;
        
        // Calculer les nouvelles coordonnées en fonction de la rotation sur Y
        // const offsetY = Math.cos(angleY) * tubeLength;
        // const offsetZ = Math.sin(angleY) * tubeLength;
        
        // Appliquer les offsets en fonction de l'équipe
        if (this.TeamId === 1) {
            worldTubePos.y -= tubeLength - 1.66;
        } else {
            worldTubePos.y += tubeLength - 1.66;
        }
        // worldTubePos.z += 1.66;
        
        return worldTubePos;
    }
    
    getCannonPosInTheWorld()
    {
        const worldCannonPos = new THREE.Vector3();
        const cannon = this.getCannon();
        cannon.getWorldPosition(worldCannonPos);
        return worldCannonPos;
    }

    getCannonTubeRotation()
    {
        // const cannonTube = this.getCannonTube();
        // const box = new THREE.Box3().setFromObject(cannonTube);
        
        // // Calculer les côtés du triangle rectangle
        // const adjacent = (box.max.y - box.min.y) / 2;  // Distance verticale (y)
        // const oppose = (box.max.z - box.min.z) / 2;    // Distance horizontale (z)
        
        // // Utiliser le théorème de Thalès pour calculer l'angle
        // // tan(θ) = opposé / adjacent
        // const angleY = Math.atan2(oppose, adjacent);

        // console.log('angleY : ', angleY * 180 / Math.PI);
        
        // return angleY;
        return (this.getCannonTube().rotation);
    }

    getCannonTube()
    {
        return (this.getCannon().getObjectByName(`cannon${this.TeamId}_tube_group`));
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
