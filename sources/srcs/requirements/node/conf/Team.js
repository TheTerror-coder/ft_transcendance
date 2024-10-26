class Team
{
    constructor(name, nbPlayer, TeamId)
    {
        this.TeamId = TeamId;
        this.name = name;
        this.nbPlayer = 0;
        this.maxNbPlayer = nbPlayer;
        this.player = new Map();
        this.boat = { x: 0, y: 0, z: 0 };
        this.cannon = { x: 0, y: 0, z: 0 };
        this.isFull = false;
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

    setBoatPosition(x, y, z)
    {
        this.boat.x = x;
        this.boat.y = y;
        this.boat.z = z;
    }

    setCannon(cannon)
    {
        this.cannon = cannon;
    }

    setCannonPosition(x, y, z)
    {
        this.cannon.x = x;
        this.cannon.y = y;
        this.cannon.z = z;
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
        if (!this.boat) {
            console.error(`Boat not initialized for team ${this.TeamId}`);
            return null;
        }
        return this.boat;
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

    getName()
    {
        return (this.name);
    }
}

module.exports = Team;
