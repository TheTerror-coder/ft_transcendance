// import socketIOClient from 'socket.io-client';

let savedGameCode = 
{
    _code: null, 

    get code()
    {
        return this._code;
    },

    set code(value)
    {
        this._code = value;
        if (document.getElementById("lobbyCode") !== null)
            document.getElementById("lobbyCode").innerHTML = value;
    }
};
let gameStarted = false;
let ip;
let globalSocket = null;
let nbPerTeam;


let error = null;
let creator = null;

// This one is for the two player lobby when it come to chose for the team to join
// the value 0 is for all team available, 1 is for only blackbeard available, 2 is for only whitebeard available
let teamAvailable = {
    _team: null, 

    get team()
    {
        return this._team;
    },

    set team(value)
    {
        this._team = value;
    }
};

// This one is for the two player lobby when it come to chose for the role in the team that we join
// the value 0 is for all role available, 1 is for only captain is available, 2 is for only canonneer available

let roleAvailableBlackBeard = 
{
    _role: null, 

    get role()
    {
        return this._role;
    },

    set role(value)
    {
        if (value === 0)
            this._role = "both";
        else if (value === 1)
            this._role = "captain";
        else if (value === 2)
            this._role = "gunner";
        else
            this._role = "none";
    }
};

let roleAvailableWhiteBeard = 
{
    _role: null, 

    get role()
    {
        return this._role;
    },

    set role(value)
    {
        if (value === 0)
            this._role = "both";
        else if (value === 1)
            this._role = "captain";
        else if (value === 2)
            this._role = "gunner";
        else
            this._role = "none";
    }
};

function initializeGlobalSocket(socket)
{
    globalSocket = socket;
    globalSocket.on('gameCreated', (data) => {
        savedGameCode.code = data.gameCode; // Sauvegarder le code de la partie
        creator = data.creator;
    });
    globalSocket.on('gameJoined', (data) => {
        savedGameCode.code = data.gameCode; // Sauvegarder le code de la partie
        nbPerTeam = data.nbPlayerPerTeam;
        creator = data.creator;
        gameFound = true;
    });
    globalSocket.on('AvailableOptions', AvailableOptionsEvent);
    
    globalSocket.on('updatePlayerLists', UpdatePlayerListEvent);

    globalSocket.on('startGame', StartGameEvent);

    globalSocket.on('TeamsFull', TeamsFullEvent);

    globalSocket.on('TeamsNotFull', TeamsNotFullEvent);

    // globalSocket.on('CreatorLeave', CreatorLeaveEvent);

    // globalSocket.on('tournamentCreated', tournamentCreatedEvent);

    // globalSocket.on('tournamentJoined', tournamentJoinedEvent);

    // globalSocket.on('tournamentFull', tournamentFullEvent);

    globalSocket.on('error', (data) => {
        error = data.message;
        alert(data.message);
    });
}

// const tournamentCreatedEvent = (data) => {
//     savedGameCode.code = data.tournamentCode;
// }

// const tournamentJoinedEvent = (data) => {
//     savedGameCode.code = data.tournamentCode;
// }

// const tournamentFullEvent = (data) => {
//     console.log("TOURNAMENT FULL: ", data);
// }

// const CreatorLeaveEvent = () => {

// }

const TeamsNotFullEvent = () => {
    // console.log("creator: ", creator, ", globalSocket.id: ", globalSocket.id);
    // creator = data.creator;
    if (creator === globalSocket.id)
    {
        if (ELEMENTs.PlayButtonInLobby())
            ELEMENTs.PlayButtonInLobby().style.display = "none";
    }
}

const AvailableOptionsEvent = (data) => {
    console.log("AvailableOptionsEvent", data);
    if (nbPerTeam == 2 && document.getElementById("lobbyCode") === null)
    {
        initializeTeamAvailableJoinLobbyInfo(data)
        initializeRoleAvailablePerTeamJoinLobbyInfo(data);
    }
}

const UpdatePlayerListEvent = async (data) => {
    console.log("Reception des listes des joueurs :", data);
    updateLobby(data);

    if (document.getElementById("lobbyCode") === null)
    {   
        if (data[1].length === 2)
        {
            teamAvailable.team = 2;
            if (data[2].length === 0)
                roleAvailableWhiteBeard.role = 0;
            else
            {
                if (data[2][0].role === "captain")
                    roleAvailableWhiteBeard.role = 2;
                else if (data[2][0].role === "Cannoneer")
                    roleAvailableWhiteBeard.role = 1;
            }
        }
        else if (data[2].length === 2)
        {
            console.log("!!!!!data[2] dans updatePlayerList: ", data[2][0])
            teamAvailable.team = 1;
            if (data[1].length === 0)
                roleAvailableBlackBeard.role = 0;
            else
            {
                if (data[1][0].role === "captain")
                    roleAvailableBlackBeard.role = 2;
                else if (data[1][0].role === "Cannoneer")
                    roleAvailableBlackBeard.role = 1;
            }
        }
        else
        {
            teamAvailable.team = 0;
            if (data[1][0].role === "captain")
                roleAvailableBlackBeard.role = 2;
            else if (data[1][0].role === "Cannoneer")
                roleAvailableBlackBeard.role = 1;
            if (data[2][0].role === "captain")
                roleAvailableWhiteBeard.role = 2;
            else if (data[2][0].role === "Cannoneer")
                roleAvailableWhiteBeard.role = 1;
        }
        displayAvailableRoleAndTeamJoin();
    }
}

const TeamsFullEvent = () => 
{
    console.log("creator: ", creator, ", globalSocket.id: ", globalSocket.id);
    if (creator === globalSocket.id)
    {
        if (ELEMENTs.PlayButtonInLobby())
            ELEMENTs.PlayButtonInLobby().style.display = "block";
    }
}

const StartGameEvent = async (data) => 
{
    const module = await import ('../pong/pong.js');
    document.getElementById('background').innerHTML = "";
    ELEMENTs.background().style.backgroundImage = '';
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/lobbyPage/luffyBoat.png')";
    try
    {
        const isFinish = await module.main(savedGameCode.code, globalSocket, currentLanguage);
        console.log("globalSocket dans startGame: ", globalSocket);
        console.log("isFinish dans startGame: ", isFinish);
        globalSocket.off('startGame', StartGameEvent);
        globalSocket.off('TeamsFull', TeamsFullEvent);
        globalSocket.off('updatePlayerLists', UpdatePlayerListEvent);
        globalSocket.off('AvailableOptions', AvailableOptionsEvent);
    }
    catch (error)
    {
        console.log("error dans startGame: ", error);
    }
}


async function initializeTeamAvailableJoinLobbyInfo(data)
{
    if (data.teams[0] && !data.teams[1])
    {
        if (data.teams[0].name === "Black-Beard")
            teamAvailable.team = 1;
        else
            teamAvailable.team = 2;
    }
    else
        teamAvailable.team = 0;
}

function initializeRoleAvailablePerTeamJoinLobbyInfo(data)
{
    const blackBeardTeam = data.teamsRoles[0];
    const whiteBeardTeam = data.teamsRoles[1];
    if (teamAvailable.team === 0)
    {
        initializeBlackBeardRoleAvailable(blackBeardTeam);
        initializeWhiteBeardRoleAvailable(whiteBeardTeam);
    }
    else if (teamAvailable.team === 1)
        initializeBlackBeardRoleAvailable(blackBeardTeam);
    else if (teamAvailable.team === 2)
        initializeWhiteBeardRoleAvailable(whiteBeardTeam);
}

async function chooseRoleSwitchDisable(roleAvailable)
{
    if (roleAvailable === "captain")
    {
        ELEMENTs.chooseRoleSwitch().checked = false;
        ELEMENTs.chooseRoleSwitch().disabled = true;
    }
    else if (roleAvailable === "gunner")
    {
        ELEMENTs.chooseRoleSwitch().checked = true;
        ELEMENTs.chooseRoleSwitch().disabled = true;
    }
    switchRole();
}

async function displayAvailableRoleAndTeamJoin()
{
    if (teamAvailable.team === 1)
    {
        ELEMENTs.chooseTeamSwitch().checked = false;
        ELEMENTs.chooseTeamSwitch().disabled = true;
        chooseRoleSwitchDisable(roleAvailableBlackBeard.role);
    }
    else if (teamAvailable.team === 2)
    {
        ELEMENTs.chooseTeamSwitch().checked = true;
        ELEMENTs.chooseTeamSwitch().disabled = true;
        chooseRoleSwitchDisable(roleAvailableWhiteBeard.role);
    }
    switchTeam();
}

function initializeWhiteBeardRoleAvailable(whiteBeardTeam)
{
    console.log("dans TeamAvailable.team: ", teamAvailable, ", whiteBeardTeam.roles: ", whiteBeardTeam.roles);

    if (whiteBeardTeam.roles[1] === undefined)
    {
        if (whiteBeardTeam.roles[0] !== undefined)
            whiteBeardTeam.roles[0].value === "captain" ? roleAvailableWhiteBeard.role = 1 : roleAvailableWhiteBeard.role = 2;
        else
        {
            teamAvailable.team = 1;
            roleAvailableWhiteBeard.role = 0;
        }
    }
    else
        roleAvailableWhiteBeard.role = 0;
    console.log("WHITEEEE Apres initializewHITEBeardRoleAvailable: ", roleAvailableWhiteBeard.role);

}

function initializeBlackBeardRoleAvailable(blackBeardTeam)
{
    console.log("dans TeamAvailable.team: ", teamAvailable, ", blackBeardTeam.roles: ", blackBeardTeam.roles);
    console.log("blackBeardTeam.roles[1]: ", blackBeardTeam.roles[1]);

    if (blackBeardTeam.roles[1] === undefined)
    {
        if (blackBeardTeam.roles[0] !== undefined)
            blackBeardTeam.roles[0].value === "captain" ? roleAvailableBlackBeard.role = 1 : roleAvailableBlackBeard.role = 2;
        else
        {
            teamAvailable.team = 2;
            roleAvailableBlackBeard.role = 0;
        }
    }
    else
        roleAvailableBlackBeard.role = 0;
    console.log("Apres initializeBlackBeardRoleAvailable: ", roleAvailableBlackBeard.role);
}

async function createLobbyDisplay()
{
    const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);

	if (!await isUserAuthenticated({}))
		replace_location(URLs.VIEWS.LOGIN_VIEW);
    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
    {
		
		nbPerTeam = 1;
        globalSocket.emit('createGame', { numPlayersPerTeam: nbPerTeam });
		setTimeout( () => {
			if (error)
			{
				alert(error);
				error = null;
				return ;
			}
		}, 20);
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
        ELEMENTs.usernameOfWanted().innerHTML = response.username;
        const photoUrl = response.photo;
        const imgElement = ELEMENTs.pictureOfWanted();
        imgElement.src = photoUrl;
        ELEMENTs.primeAmount().innerHTML = response.prime;
        setTimeout(() => {
            globalSocket.emit('confirmChoicesCreateGame', { teamID: 1, role: "captain", userName: response.username, gameCode: savedGameCode.code });
        }, 20)
        setTimeout(async () => {
            if (error !== null)
            {
                console.log("error: ", error);
                error = null;
                await replace_location(URLs.VIEWS.HOME);
                return ;
            }
        }, 70);
        savedGameCode.code = savedGameCode.code;
        refreshLanguage();
    }
    else
        createLobbyforTwoPlayer();
}

async function createLobbyforTwoPlayer()
{
    console.log("GLOBAL SOCKET: ", globalSocket);
    nbPerTeam = 2;
    globalSocket.emit('createGame', { numPlayersPerTeam: nbPerTeam });
	setTimeout(() => {
		if (error)
		{
			alert(error);
			error = null;
			return ;
		}
	}, 20);
	if (!await isUserAuthenticated({}))
		replace_location(URLs.VIEWS.LOGIN_VIEW);
    ELEMENTs.contentCreateLobby().innerHTML = TeamAndRoleTwoPlayerLobbyVAR;
    ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
    ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
    ELEMENTs.buttonCreate().onclick = () => lobbyTwoPlayer();
    refreshLanguage();
}


async function lobbyTwoPlayer()
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().checked;
    const roleChosen = ELEMENTs.chooseRoleSwitch().checked;

    const teamID = teamChosen ? 2 : 1;
    const role = roleChosen ? "Cannoneer" : "captain";
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);

    globalSocket.emit('confirmChoicesCreateGame', { teamID, role, userName: user.username, gameCode: savedGameCode.code });
    setTimeout(() => {
        if (error !== null)
        {
            console.log("error: ", error);
            error = null;
			replace_location(URLs.VIEWS.HOME);
            return ;
        }
    }, 20);
    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;
    setTimeout(() => {
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }, 20);
        
    savedGameCode.code = savedGameCode.code;
    refreshLanguage();
}


function switchRole()
{
    if (ELEMENTs.chooseRoleSwitch())
    {
        if (ELEMENTs.chooseRoleSwitch().checked == true)
        {
            ELEMENTs.helmsmanRoleDisplay().style.transition = "opacity 0.5s ease";
            ELEMENTs.gunnerRoleDisplay().style.transition = "opacity 0.5s ease";
            ELEMENTs.helmsmanRoleDisplay().style.opacity = "0.3";
            ELEMENTs.gunnerRoleDisplay().style.opacity = "0.9";
        }
        else
        {
            ELEMENTs.helmsmanRoleDisplay().style.transition = "opacity 0.5s ease";
            ELEMENTs.helmsmanRoleDisplay().style.opacity = "0.9";
            ELEMENTs.gunnerRoleDisplay().style.transition = "opacity 0.5s ease";
            ELEMENTs.gunnerRoleDisplay().style.opacity = "0.3";
        }
    }
}

async function switchTeam()
{
    const kurohige = document.getElementById("KurohigeTeam");
    if (ELEMENTs.chooseTeamSwitch())
    {
        if (ELEMENTs.chooseTeamSwitch().checked == true)
        {
            ELEMENTs.chooseRoleSwitch().disabled = false;
            kurohige.style.opacity = "0.3";
            kurohige.style.transition = "opacity 0.5s ease";
            ELEMENTs.ShirohigeTeam().style.transition = "opacity 0.5s ease";
            ELEMENTs.ShirohigeTeam().style.opacity = "0.9";
            await chooseRoleSwitchDisable(roleAvailableWhiteBeard.role);
        }
        else
        {
            ELEMENTs.chooseRoleSwitch().disabled = false;
            kurohige.style.transition = "opacity 0.5s ease";
            kurohige.style.opacity = "0.9";
            ELEMENTs.ShirohigeTeam().style.transition = "opacity 0.5s ease";
            ELEMENTs.ShirohigeTeam().style.opacity = "0.3";
            await chooseRoleSwitchDisable(roleAvailableBlackBeard.role);
        }
    }
}