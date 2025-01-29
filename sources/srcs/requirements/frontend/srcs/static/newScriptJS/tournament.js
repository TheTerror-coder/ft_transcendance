
let nbPlayer = null;
let winner = null;
let winnerOfTournament = null;



let creatorTournament = 
{
    _id: null, 

    get id()
    {
        return this._id;
    },

    set id(value)
    {
        this._id = value;
        if (document.getElementById("startTournament") !== null)
            document.getElementById("startTournament").display = 'block';
    }
};

let tournamentAllUsers = 
{
    _user: [],

    get users() {
        return this._user;
    },

    set users(value) 
	{
		this._user.push(value);
		if (document.getElementById("winnerOfTheTournament")) // ?
			displayBinaryTree();
	},
	clearUsers() {
		this._user = [];
	},
	removeUser(username)
	{
        this._user = this._user.filter(user => user !== username);
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
    // globalSocket.on('tournamentMatches', tournamentMatchesEvent);
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
	creatorTournament.id = data.creator;
}

const tournamentJoinedEvent = (data) => {
    savedTournamentCode.code = data.tournamentCode;
}

const tournamentFullEvent = (data) => {
	console.log("tournamentFullEvent data: ", data);
}

const tournamentPlayerListEvent = (data) => {
	if (nbPlayer)
		console.log("nbPlayer dans tournamentPlayerListEvent:  ", nbPlayer, ", CHELOU LE LOUP data.length: ", data.length);
	if (nbPlayer !== null && nbPlayer > data.length)
	{
		nbPlayer = data.length;
		// if (creator === globalSocket.id && document.getElementById("startButtonTournament") && document.getElementById("startButtonTournament").display == 'none')
		// 	document.getElementById("startButtonTournament").display = 'none';
		usersInTournament(data, true);
	}
	else
	{
		nbPlayer = data.length;
		usersInTournament(data, false);
	}
}

const tournamentMatchEvent = (data) => {
	console.log("stp freerrrro");
	setTimeout (() => {
		tournamentAllUsers.users = data.team1;
		tournamentAllUsers.users = data.team2;

	}, 20);
}


const startTournamentGameEvent = async (data) => {
    const module = await import('../pong/pong.js');
    ELEMENTs.allPage().innerHTML = "";
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/lobbyPage/luffyBoat.png')";
    await module.main(data.gameCode, globalSocket, currentLanguage);
}

const tournamentWinnerEvent = (data) => {
    winnerOfTournament = data;
    refreshWinner(winnerOfTournament);
    setTimeout(() => {
        replace_location(URLs.VIEWS.HOME);
    }, 20000);
}

function refreshWinner(winnerOfTournament) {
    const maxAttempts = 10;
    let attempts = 0;
    
    const tryUpdateWinner = () => {
        const winnerElement = document.getElementById("winnerOfTheTournament");
        if (winnerElement)
            winnerElement.innerHTML = winnerOfTournament;
        else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryUpdateWinner, 1000);
        }
    };
    tryUpdateWinner();
}

async function joinTournament(code)
{
	if (!Number.isFinite(Number(code)))
	{
		alert("Please put only numbers");
		return ;
	}
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('joinTournament', {teamName: user.username, tournamentCode: code});
    setTimeout(() => {
		if (error === null)
		{
			ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
			ELEMENTs.centerTournament().style.justifyItems = "center";
			savedTournamentCode.code = code
			refreshLanguage();
		}
		else
			error = null;
    }, 20);
}

async function createTournament()
{
    const socket = await initializeSocket();
    initializeTournamentGlobalSocket(socket);
    ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('createTournament', {teamName: user.username});
	setTimeout(() => {
		if (error)
		{
			error = null;
			return ;
		}
		refreshLanguage();
	}, 20)

    // addUserTournament(user.username);
}

// i sera le nombre de joueur qui ont rejoins en tout le tournois

async function usersInTournament(usernameTournament, disconnect) // ca faut le faire avec qund c'est shuffle
{
	setTimeout(() => {
		if (ELEMENTs.numbersOfPlayersTournament())
		{
			ELEMENTs.numbersOfPlayersTournament().innerHTML = nbPlayer;
			usernameTournament.forEach(function(element) {
				if (!tournamentAllUsers.users.includes(element))
				{
					addUserTournament(element);
					tournamentAllUsers.users = element;
				}
			});
			if (disconnect === true)
			{
				tournamentAllUsers.users.forEach(userinTournamentAllUsers => {
					if (!usernameTournament.includes(userinTournamentAllUsers))
						removeUserTournament(userinTournamentAllUsers);
				});
			}
			if (nbPlayer === 4)
			{
				document.getElementsByClassName("writeNumbersOfPlayers")[0].style.color = "rgba(51, 201, 6, 0.9)";
				ELEMENTs.tournamentWrite().innerHTML = "";
				tournamentAllUsers.clearUsers();
				displayBinaryTree();
			}
		}
	}, 20);
}

async function addUserTournament(usernameTournament)
{
    const div = document.createElement("div");
    div.className = "tournamentPlayer";
	div.id = `userTournament${usernameTournament}`;
    const p = document.createElement("p");
    p.innerHTML = usernameTournament;
    p.className = "usernameTournament";
    div.appendChild(p);
	ELEMENTs.tournamentContent().appendChild(div);
}


async function removeUserTournament(usernameToRemove)
{
	tournamentAllUsers.removeUser(usernameToRemove);
	
	const div = document.querySelector(`#userTournament${usernameToRemove}`);
	if (div)
		div.remove();
	tournamentAllUsers.removeUser(usernameToRemove);
}

function displayBinaryTree()
{
	ELEMENTs.mainPage().innerHTML = binaryTreeVAR;
	ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/tournament/colosseum.png')";
	
	// ici remplir le tournament tournamentAllUsers
	let i = 1;
	refreshLanguage();
	console.log("tournamentAllUsers.users: ", tournamentAllUsers.users);
	tournamentAllUsers.users.forEach(function(elements) 
	{
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
	console.log("creatorTournament.id: ", creatorTournament.id, ", globalSocket.id: ", globalSocket.id);
	if (creatorTournament.id === globalSocket.id)
	{
		creatorTournament.id = globalSocket.id;
		document.getElementById('startButtonTournament').onclick = () => startTournament();
	}
}

function startTournament()
{
    globalSocket.emit('tournamentStart', savedTournamentCode.code);
	setTimeout(() => {
		if (error !== null)
		{
			error = null;
			return ;
		}
	}, 20);
}