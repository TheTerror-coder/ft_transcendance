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
        // console.log("size: " + this.teams.size);
        // console.log("TeamId: " + Team.TeamId);
        if (this.teams.size < 2)
            this.teams.set(Team.TeamId, Team)
        else
            window.alert("This Game is already full...");
        console.log("size: " + this.teams.size);
    }

    getTeam(TeamID)
    {
        // console.log("this.teams.get(TeamID): " + this.teams.get(TeamID));
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

    async updateBoatPosition(teamId, x, y, z) {
        const team = this.getTeam(teamId);
        if (team) {
            const boat = team.getBoat();
            const cannon = team.getCannon();
            if (boat && cannon) {
                boat.x = x;
                boat.y = y;
                boat.z = z;
            } else {
                console.error(`Boat or cannon not found for team ${teamId}`);
            }
        } else {
            console.error(`Team ${teamId} not found`);
        }
    }

    async updateCannonPosition(teamId, x, y, z) {
        const team = this.getTeam(teamId);
        if (team) {
            const cannon = team.getCannon();
            if (cannon) {
                cannon.x = x;
                cannon.y = y;
                cannon.z = z;
            } else {
                console.error(`Cannon not found for team ${teamId}`);
            }
        } else {
            console.error(`Team ${teamId} not found`);
        }
    }

    updateClientData(team)
    {
        this.updateBoatPosition(team.TeamID, team.boat.x, team.boat.y, team.boat.z);
        this.updateCannonPosition(team.TeamID, team.cannon.x, team.cannon.y, team.cannon.z);
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

    // async updateBoatAndCannonPosition(team, boatX, boatY, boatZ, cannonX, cannonY, cannonZ) {
    //     let teamObj = this.getTeam(team);
    //     if (teamObj) {
    //         teamObj.getBoat().position.set(boatX, boatY, boatZ);
    //         teamObj.getCannon().position.set(cannonX, cannonY, cannonZ);
    //     }
    // }

    async updateBoatAndCannonPosition(teamId, boatX, boatY, boatZ, cannonX, cannonY, cannonZ) {
        console.log("updateBoatAndCannonPosition");
        console.log("teamId: " + teamId);
        console.log("boatX: " + boatX);
        console.log("boatY: " + boatY);
        console.log("boatZ: " + boatZ);
        console.log("cannonX: " + cannonX);
        console.log("cannonY: " + cannonY);
        console.log("cannonZ: " + cannonZ);
        this.updateBoatPosition(teamId, boatX, boatY, boatZ);
        this.updateCannonPosition(teamId, cannonX, cannonY, cannonZ);
    }
}

module.exports = Game;
