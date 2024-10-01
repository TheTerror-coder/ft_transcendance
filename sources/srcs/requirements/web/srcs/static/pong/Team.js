// import { Player } from "./Player.js";

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

    setIsFull()
    {
        if (this.nbPlayer == this.maxNbPlayer)
            this.isFull = true;
        else
            this.isFull = false;
    }

    getIsFull()
    {
        return (this.isFull);
    }

    setPlayer(player)
    {
        if (this.getIsFull() == true)
        {
            window.alert("This Team is already full...");
            return;
        }
        this.player.set(player.id, player);
        player.setTeamName(this.name);
        this.nbPlayer++;
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

    getBoat(boat)
    {
        return (this.boat);
    }

    getCannon(cannon)
    {
        return (cannon);
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