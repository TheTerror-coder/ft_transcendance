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
        this.boatSavedPos = {x: 0, y: 0, z: 0};
        this.cannonSavedPos = {x: 0, y: 0, z: 0};
        this.isFull = false;
        this.score = 0;
        this.gameStarted = false;
    }

    setBoatSavedPos(boatSavedPos)
    {
        this.boatSavedPos = boatSavedPos;
    }

    getBoatSavedPos()
    {
        return (this.boatSavedPos);
    }

    setCannonSavedPos(cannonSavedPos)
    {
        this.cannonSavedPos = cannonSavedPos;
    }

    getCannonSavedPos()
    {
        return (this.cannonSavedPos);
    }

    setGameStarted(gameStarted)
    {
        this.gameStarted = gameStarted;
    }

    getGameStarted()
    {
        return (this.gameStarted);
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

    getTeamName()
    {
        return (this.name);
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

    getCannonTubeTipPosition()
    {
        const pos = this.getCannonTube().getObjectByName(`cannonTipTeam${this.TeamId}`).getWorldPosition(new THREE.Vector3());
        return (pos);
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
