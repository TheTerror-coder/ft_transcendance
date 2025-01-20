let tournamentAllUsers = 
{
    _user: [],

    get users() {
        return this._user;
    },

    set users(value) {
        if (!this._user.includes(value)) {
            this._user.push(value);
        }
    }
};

async function initializeTournamentGlobalSocket(socket)
{
    globalSocket = socket;
    globalSocket.on('tournamentCreated', tournamentCreatedEvent);
    globalSocket.on('tournamentJoined', tournamentJoinedEvent);
    globalSocket.on('tournamentFull', tournamentFullEvent);
    globalSocket.on('tournamentPlayerList', tournamentPlayerListEvent);
    globalSocket.on('tournamentMatch', tournamentMatchEvent);
    globalSocket.on('startTournamentGame', startTournamentGameEvent);
}

async function joinTournamentDisplay()
{

    ELEMENTs.centerTournament().innerHTML = joinTournamentVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
    const socket = await initializeSocket();
    initializeTournamentGlobalSocket(socket);
    refreshLanguage();
    ELEMENTs.joinButtonTournament().onclick = () => joinTournament(ELEMENTs.number().value);
}

const tournamentCreatedEvent = (data) => {
    savedGameCode.code = data.tournamentCode;
    console.log("savedGameCode.code : ", savedGameCode.code);
}

const tournamentJoinedEvent = (data) => {
    savedGameCode.code = data.tournamentCode;
    console.log("savedGameCode.code : ", savedGameCode.code);
}

const tournamentFullEvent = (data) => {

    console.log("TOURNAMENT FULL: ", data);
}

const tournamentPlayerListEvent = (data) => {
    console.log("TOURNAMENT PLAYER LIST: ", data);
    console.log("data.length : ", data.length)
    usersInTournament(data, data.length);
}

const tournamentMatchEvent = (data) => {
    console.log("TOURNAMENT MATCH: ", data);
}

const startTournamentGameEvent = async (data) => {
    console.log("START TOURNANT Game")
    const module = await import('../pong/pong.js');
    document.getElementById('background').innerHTML = "";
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/lobbyPage/luffyBoat.png')";
    await module.main(data.gameCode, globalSocket, currentLanguage);
}

const errorTournamentEvent = (data) => {
    console.log("ERROR TOURNAMENT: ", data);
    alert(data.message);
    error = data.message;
}

async function joinTournament(code)
{
    console.log("JOIN TOURNAMENT");
    // tournamentCodeJS = "1234";
    // console.log("tournamentCodeJS : ", tournamentCodeJS);
    // for (let i = 0; i < 7; i++)
    // {
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // globalSocket.emit('joinTournament', {teamName: "ben" + i, tournamentCode: tournamentCodeJS});
    // }
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('joinTournament', {teamName: user.username, tournamentCode: code});
    setTimeout(() => {
        if (error !== null)
        {
            console.log("error: ", error);
            error = null;
            return ;
        }
    }, 20);
    ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
}

async function createTournament()
{
    const socket = await initializeSocket();
    initializeTournamentGlobalSocket(socket);
    console.log("CREATE TOURNAMENT");
    ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('createTournament', {teamName: user.username});
    refreshLanguage();
    addUserTournament(user.username);

    for (let i = 0; i < 8; i++)
    {
        const usernameTournament = "dbaule" + i; // represente le blaze des differents pelo
        console.log("usernameTournament : ", usernameTournament);
        addUserTournament(usernameTournament, i);
    }
    
}

// i sera le nombre de joueur qui ont rejoins en tout le tournois

async function usersInTournament(usernameTournament, nbPlayer)
{
    console.log("usersInTournament");
    ELEMENTs.numbersOfPlayersTournament().innerHTML = nbPlayer;
	nbPlayer = 8;

    // usernameTournament.forEach(function(element) {
    //     if (!tournamentAllUsers.users.includes(element))
    //     {   
    //         addUserTournament(element);
    //         tournamentAllUsers.users = element;
    //     }
    // });
    if (nbPlayer === 8)
    {
        document.getElementsByClassName("writeNumbersOfPlayers")[0].style.color = "rgba(51, 201, 6, 0.9)";
        ELEMENTs.tournamentWrite().innerHTML = "";
        displayBinaryTree();
    }
}

async function addUserTournament(usernameTournament)
{
    const div = document.createElement("div");
    div.className = "tournamentPlayer";
    const p = document.createElement("p");
    p.innerHTML = usernameTournament;
    p.className = "usernameTournament";
    div.appendChild(p);
    ELEMENTs.tournamentContent().appendChild(div);
}

function displayBinaryTree()
{
    console.log("display binary tree");
    ELEMENTs.mainPage().innerHTML = binaryTreeVAR;

    // for (let i = 0; i < 8; i++)
    // {
    //     const usernameTournament = "dbaule" + i; // represente le blaze des differents pelo
    //     console.log("usernameTournament : ", usernameTournament);
    //     addUserTournament(usernameTournament, i);
    // }
    // let i = 1;
    refreshLanguage();
    setTimeout(() => {
        tournamentAllUsers.users.forEach(function(elements) 
        {
            console.log("element dans tournamentAllUsers.users.forEach: ", elements);
            const user = elements;
            document.querySelectorAll(`[data-match="${i}"]`).forEach(function(element) 
            {
                element.innerHTML = user;
                if (element.hasAttribute("data-translate"))
                    element.removeAttribute('data-translate');
                console.log("e", element, " ET I le goat: ", i);
            });
            i++;
        });
    }, 200);
}

function startTournament()
{
    console.log("start tournament");
}