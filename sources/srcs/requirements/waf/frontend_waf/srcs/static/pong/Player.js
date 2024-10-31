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

    setCameraPos(boat, cannon)
    {
        if (!boat || !cannon) {
            console.error('Boat or cannon is undefined in setCameraPos');
            return;
        }
        console.log('setCameraPos : ', boat.position.x, boat.position.y, boat.position.z);
        console.log('cannon : ', cannon.position.x, cannon.position.y, cannon.position.z);
        console.log('this.TeamID : ', this.TeamID);
        console.log('this.role : ', this.role);
        var p = 0;
        var crx = 0;
        var cry = 0;
        var crz = 0;
        var s = 0;
        var a = 0;

        if (this.TeamID == 1)
        {
            p = -(cannon.scale.y * 2.5) + 1.40;
            crx = -60 * (Math.PI / 180);
            cry = 0;
            crz = Math.PI;
            s = Math.PI;
            a = 5;
        }
        else if (this.TeamID == 2)
        {
            p = (cannon.scale.y * 2.5) - 1.40;
            crx = 60 * (Math.PI / 180);
            cry = 0;
            crz = 0;
            s = 0;
            a = -5;
        }
        console.log('crx : ', crx);
        console.log('cry : ', cry);
        console.log('crz : ', crz);
        if (this.role == 'captain')
        {
            this.cameraPos = { x: boat.position.x, y: a, z: 40 };
            this.cameraRotation = { x: 0, y: 0, z: s };
            console.log('this.cameraPos : ', this.cameraPos);
            console.log('this.cameraRotation : ', this.cameraRotation);
        }
        else if (this.role == 'Cannoneer')
        {
            this.cameraPos = { x: cannon.position.x, y: cannon.position.y + p, z: cannon.position.z + 3.5 };
            this.cameraRotation = { x: crx, y: cry, z: crz };
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
