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
        this.nbPlayerPerTeam = 0;
        this.nbPlayerConnected = 0;
    }

    addNbPlayerConnected()
    {
        console.log("addNbPlayerConnected");
        this.nbPlayerConnected++;
    }

    removeNbPlayerConnected()
    {
        console.log("removeNbPlayerConnected");
        this.nbPlayerConnected--;
    }

    setNbPlayerPerTeam(nbPlayerPerTeam)
    {
        this.nbPlayerPerTeam = nbPlayerPerTeam;
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

    getNbPlayerPerTeam()
    {
        return (this.nbPlayerPerTeam);
    }

    removeTeam(Team)
    {
        this.teams.delete(Team.TeamId)
    }

    updateBoatPosition(TeamID, x, y, z)
    {
        console.log("updateBoatPosition");
        console.log("TeamID: " + TeamID);
        console.log("x: " + x);
        console.log("y: " + y);
        console.log("z: " + z);
        console.log("this.getTeam(TeamID) : " + this.getTeam(TeamID));
        console.log("this.getTeam(TeamID) : " + this.getTeam(TeamID));
        console.log("this.getTeam(TeamID) : " + this.getTeam(TeamID));
        this.getTeam(TeamID).getBoat().position.x = x;
        this.getTeam(TeamID).getBoat().position.y = y;
        this.getTeam(TeamID).getBoat().position.z = z;
    }

    updateCannonPosition(TeamID, x, y, z)
    {
        console.log("updateCannonPosition");
        console.log("TeamID: " + TeamID);
        console.log("x: " + x);
        console.log("y: " + y);
        console.log("z: " + z);
        console.log("this.getTeam(TeamID) : " + this.getTeam(TeamID));
        console.log("this.getTeam(TeamID) : " + this.getTeam(TeamID));
        console.log("this.getTeam(TeamID) : " + this.getTeam(TeamID));
        this.getTeam(TeamID).getCannon().position.x = x;
        this.getTeam(TeamID).getCannon().position.y = y;
        this.getTeam(TeamID).getCannon().position.z = z;
    }

    updateClientData(team)
    {
        this.updateBoatPosition(team.TeamId, team.boat.x, team.boat.y, team.boat.z);
        this.updateCannonPosition(team.TeamId, team.cannon.x, team.cannon.y, team.cannon.z);
    }

    sendGameData(io, gameCode)
    {
        console.log("sendGameData");
        const teamsArray = {
            team1: {
                TeamId: this.getTeam(1).TeamId,
                Name: this.getTeam(1).name,
                MaxNbPlayer: this.getTeam(1).maxNbPlayer,
                NbPlayer: this.getTeam(1).nbPlayer,
                Boat: this.getTeam(1).boat,
                Cannon: this.getTeam(1).cannon,
                Player: Array.from(this.getTeam(1).player.entries()).reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {}),
                IsFull: this.getTeam(1).isFull,
            },
            team2: {
                TeamId: this.getTeam(2).TeamId,
                Name: this.getTeam(2).name,
                MaxNbPlayer: this.getTeam(2).maxNbPlayer,
                NbPlayer: this.getTeam(2).nbPlayer,
                Boat: this.getTeam(2).boat,
                Cannon: this.getTeam(2).cannon,
                Player: Array.from(this.getTeam(2).player.entries()).reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {}),
                IsFull: this.getTeam(2).isFull,
            }
        }
        console.log('teamsArray : ', teamsArray);
        io.to(gameCode).emit('gameData', teamsArray);
    }
}

module.exports = Game;
