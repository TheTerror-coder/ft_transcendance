class Player
{
    constructor(id, role, name, TeamID)
    {
        this.socket = null;
        this.id = id;
        this.role = role;
        this.name = name;
        this.cameraPos = { x: 0, y: 0, z: 0 };
        this.cameraRotation = { x: 0, y: 0, z: 0 };
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

    getCameraRotation()
    {
        return (this.cameraRotation);
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
        var r = 0;

        if (this.TeamID == 1)
        {
            p = -2.9;
            r = 60 * (Math.PI / 180);
        }
        else if (this.TeamID == 2)
        {
            p = 2.9;
            r = -60 * (Math.PI / 180);
        }
        console.log('r : ', r);
        if (this.role == 'captain')
        {
            this.cameraPos = { x: x, y: 40, z: 10 };
            this.cameraRotation = { x: 0, y: 0, z: 0 };
            this.cameraRotation.x = 180 * (Math.PI / 180);
            console.log('this.cameraPos : ', this.cameraPos);
            console.log('this.cameraRotation : ', this.cameraRotation);
        }
        else if (this.role == 'cannoneer')
        {
            this.cameraPos = { x: x, y: y + p, z: z + 2.5 };
            this.cameraRotation = { x: r, y: 0, z: 0 };
            console.log('this.cameraPos : ', this.cameraPos);
            console.log('this.cameraRotation : ', this.cameraRotation);
        }
    }

    setSocket(socket)
    {
        this.socket = socket;
    }
}

export default Player;
