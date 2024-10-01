class Game
{  
    constructor()
    {
        this.ballPosition = { x: 0, y: 0, z: 0 };
        this.ballDirection = { x: 0, y: 0, z: 0 };
        this.gameInterval = null;
        this.tickRate = 1000 / 60;
        this.gameStarted = false;
        this.teams = new Map();
    }
    
    setTeam(Team)
    {
        console.log("size: " + this.teams.size);
        console.log("TeamId: " + Team.TeamId);
        if (this.teams.size < 2)
            this.teams.set(Team.TeamId, Team)
        else
            window.alert("This Game is already full...");
        console.log("size: " + this.teams.size);
    }

    getTeam(TeamID)
    {
        console.log("this.teams.get(TeamID): " + this.teams.get(TeamID));
        return (this.teams.get(TeamID));
    }

    removeTeam(Team)
    {
        this.teams.delete(Team.TeamId)
    }

    updateBoatPosition(TeamID, x, y)
    {
        this.getTeam(TeamID).getBoat().position.x = x;
        this.getTeam(TeamID).getBoat().position.y = y;
    }

    startGame()
    {
        this.gameStarted = true;
        console.log("Game started");
    }
}

module.exports = Game;
