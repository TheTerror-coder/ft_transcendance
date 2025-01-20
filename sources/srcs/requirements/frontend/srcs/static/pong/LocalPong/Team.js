class Team {
    constructor(name, nbPlayer, TeamId) {
        this.TeamId = TeamId;
        this.name = name;
        this.nbPlayer = 0;
        this.maxNbPlayer = nbPlayer;
        this.player = new Map();
        this.boat = null;
        this.cannon = null;
        this.score = 0;
    }

    setScore(score) {
        this.score = score;
    }

    getScore() {
        return this.score;
    }

    setPlayer(player) {
        this.player.set(player.id, player);
        this.nbPlayer++;
    }

    setBoat(boat) {
        this.boat = boat;
    }

    setCannon(cannon) {
        this.cannon = cannon;
    }

    getTeamId() {
        return this.TeamId;
    }

    getBoatGroup() {
        return this.boat;
    }

    getBoat() {
        return this.boat.getObjectByName(`bateauTeam${this.TeamId}`);
    }

    getCannon() {
        return this.boat.getObjectByName(`cannonTeam${this.TeamId}`);
    }

    getName() {
        return this.name;
    }
}

export default Team; 