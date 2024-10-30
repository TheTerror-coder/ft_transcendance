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
        if (this.TeamId == 1)
        {
            this.cannon.position.set(this.boat.position.x - (this.boat.scale.x / 2) + 2, this.boat.position.y - 2.18, this.boat.position.z * this.boat.scale.z + 8.1);
            this.cannon.rotation.set(0, 0, -Math.PI / 2);
        }
        else if (this.TeamId == 2)
        {
            this.cannon.position.set(this.boat.position.x - (this.boat.scale.x / 2) + 2, this.boat.position.y + 3.98, this.boat.position.z * this.boat.scale.z + 8.1);
            this.cannon.rotation.set(0, 0, Math.PI / 2);
        }
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

    getBoat()
    {
        return (this.boat);
    }

    getCannon()
    {
        return (this.cannon);
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