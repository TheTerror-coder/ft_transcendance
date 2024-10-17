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

    setCameraPos(x, y, z)
    {
        console.log('setCameraPos : ', x, y, z);
        console.log('this.TeamID : ', this.TeamID);
        console.log('this.role : ', this.role);
        var p = 0;

        if (this.TeamID == 1)
            p = -2.9;
        else if (this.TeamID == 2)
            p = 2.9;
        console.log(p + ' + ' + y + ' = ' + (y + p));
        if (this.role == 'captain')
        {
            this.cameraPos = { x: x, y: y + p, z: z + 2.5 };
        }
        else if (this.role == 'cannoneer')
        {
            this.cameraPos = { x: x, y: y, z: z };
        }
    }

    setSocket(socket)
    {
        this.socket = socket;
    }
}

export default Player;
