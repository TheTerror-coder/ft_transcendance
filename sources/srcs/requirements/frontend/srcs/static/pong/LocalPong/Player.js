class Player {
    constructor(id, role, name, TeamID) {
        this.id = id;
        this.role = role;
        this.name = name;
        this.TeamID = TeamID;
        this.cameraPos = { x: 0, y: 0, z: 0 };
        this.cameraRotation = { x: 0, y: 0, z: 0 };
    }

    getId() {
        return this.id;
    }

    getRole() {
        return this.role;
    }
    
    getName() {
        return this.name;
    }

    getTeamID() {
        return this.TeamID;
    }

    setCameraPos(boat, cannon) {
        if (this.TeamID == 1) {
            this.cameraPos = { x: 0, y: 0, z: 50 };
            this.cameraRotation = { x: 0, y: 0, z: Math.PI };
        } else {
            this.cameraPos = { x: 0, y: 0, z: 50 };
            this.cameraRotation = { x: 0, y: 0, z: 0 };
        }
    }

    getCameraPos() {
        return this.cameraPos;
    }

    getCameraRotation() {
        return this.cameraRotation;
    }
}

export default Player; 