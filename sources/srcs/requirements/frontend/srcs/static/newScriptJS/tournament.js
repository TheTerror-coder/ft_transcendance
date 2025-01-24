let winner = null;
let winnerOfTournament = null;

let tournamentAllUsers = 
{
    _user: [],

    get users() {
        return this._user;
    },

    set users(value) 
	{
		this._user.push(value);
		if (document.getElementById("winnerOfTheTournament"))
			displayBinaryTree();
	},
	clearUsers() {
		this._user = [];
	}
};

let savedTournamentCode = 
{
    _code: null, 

    get code()
    {
        return this._code;
    },

    set code(value)
    {
        this._code = value;
        if (document.getElementById("tournamentCode") !== null)
            document.getElementById("tournamentCode").innerHTML = value;
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
    globalSocket.on('tournamentWinner', tournamentWinnerEvent);
    globalSocket.on('tournamentMatches', tournamentMatchesEvent);
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
    savedTournamentCode.code = data.tournamentCode;
}

const tournamentJoinedEvent = (data) => {
    savedTournamentCode.code = data.tournamentCode;
}

const tournamentFullEvent = (data) => {
    console.log("TOURNAMENT FULL: ", data);
}

const tournamentPlayerListEvent = (data) => {
    usersInTournament(data, data.length);
}

const tournamentMatchEvent = (data) => {

	tournamentAllUsers.users = data.team1;
	tournamentAllUsers.users = data.team2;
}

const tournamentMatchesEvent = (data) => {
    console.log("TOURNAMENT MATCHES: ", data);
}

const startTournamentGameEvent = async (data) => {
    console.log("START TOURNANT Game")
    const module = await import('../pong/pong.js');
    document.getElementById('background').innerHTML = "";
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/lobbyPage/luffyBoat.png')";
    await module.main(data.gameCode, globalSocket, currentLanguage);
    console.log("Tournament End");
}

const tournamentWinnerEvent = (data) => {
    console.log("TOURNAMENT WINNER: ", data);
	winner = data;
}


const errorTournamentEvent = (data) => {
	console.log("ERROR TOURNAMENT: ", data);
    alert(data.message);
    error = data.message;
}

async function joinTournament(code)
{
    console.log("JOIN TOURNAMENT");
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('joinTournament', {teamName: user.username, tournamentCode: code});
    setTimeout(() => {
        if (error !== null)
        {
            console.log("error: ", error);
			alert(error)
            error = null;
			replace_location(URLs.VIEWS.TOURNAMENT);   
            return ;
        }
    }, 20);
    ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
	refreshLanguage();
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
	setTimeout(() => {
		if (error)
		{
			alert(error);
			error = null;
			return ;
		}
		refreshLanguage();
	}, 20)

    // addUserTournament(user.username);
}

// i sera le nombre de joueur qui ont rejoins en tout le tournois

async function usersInTournament(usernameTournament, nbPlayer) // ca faut le faire avec qund c'est shuffle
{
    console.log("usersInTournament");
    ELEMENTs.numbersOfPlayersTournament().innerHTML = nbPlayer;

    usernameTournament.forEach(function(element) {
        if (!tournamentAllUsers.users.includes(element))
        {   
            addUserTournament(element);
            tournamentAllUsers.users = element;
        }
    });
    if (nbPlayer === 4)
    {
        document.getElementsByClassName("writeNumbersOfPlayers")[0].style.color = "rgba(51, 201, 6, 0.9)";
        ELEMENTs.tournamentWrite().innerHTML = "";
		tournamentAllUsers.clearUsers();
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
    ELEMENTs.mainPage().innerHTML = binaryTreeVAR;
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/tournament/colosseum.png')";

	// ici remplir le tournament tournamentAllUsers
    let i = 1;
    refreshLanguage();
	tournamentAllUsers.users.forEach(function(elements) 
	{
		// console.log("element dans tournamentAllUsers.users.forEach: ", elements);
		const user = elements;
		document.querySelectorAll(`[data-match="${i}"]`).forEach(function(element) 
		{
			element.innerHTML = user;
			if (user.length > 6)
			{
				element.style.setProperty('--spacing', '9em');
				element.style.setProperty('--end', '9em');
			}
			if (element.hasAttribute("data-translate"))
				element.removeAttribute('data-translate');
		});
		i++;
	});
	if (winner)
	{
		document.getElementById("winnerOfTheTournament").innerHTML = winner;
		winner = null;
	}
    document.getElementById('startButtonTournament').onclick = () => startTournament();
}

function startTournament()
{
    console.log("start tournament");
    globalSocket.emit('tournamentStart', savedTournamentCode.code);
	setTimeout(() => {
		if (error !== null)
		{
			console.log("error: ", error);
			error = null;
			return ;
		}

	}, 20);
}