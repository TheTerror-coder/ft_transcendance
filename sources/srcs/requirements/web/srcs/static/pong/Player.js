class Player
{
    constructor(id, role, name, TeamID)
    {
        this.socket = null;
        this.id = id;
        this.role = role;
        this.name = name;
        this.cameraPos = null;
        this.TeamID = TeamID;
    }

    getId()
    {
        return (this.id);
    }

    getRole()
    {
        return (this.role);
    }
    
    getName()
    {
        return (this.name);
    }

    getCameraPos()
    {
        return (this.cameraPos);
    }

    getTeamID()
    {
        return (this.TeamID);
    }

    setTeamID(TeamID)
    {
        this.TeamID = TeamID;
    }

    setCameraPos()
    {
        var p = 0;
        if (this.TeamID == 0)
            p = 1;
        else if (this.TeamID == 1)
            p = -1;
        if (this.role == 'Captain')
        {
            this.cameraPos = { x: 0, y: 0, z: 20 * p }
        }
        else if (this.role == 'Cannoneer')
        {
            this.cameraPos = { x: 0, y: 0, z: 20 * p }
        }
    }

    setSocket(socket)
    {
        this.socket = socket;
    }
}

module.exports = Player;