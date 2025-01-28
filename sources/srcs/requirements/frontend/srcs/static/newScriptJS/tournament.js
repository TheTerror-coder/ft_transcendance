
let nbPlayer = null;
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
	},
	removeUser(username)
	{
        // Remove the user from the _user array
        this._user = this._user.filter(user => user !== username);
        
        // Optionally remove the user from the DOM if you have UI elements representing users
        const userDiv = document.querySelector(`#userTournament${username}`);
        if (userDiv) {
            userDiv.remove();
        }
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
	creator = data.creator;
}

const tournamentJoinedEvent = (data) => {
    savedTournamentCode.code = data.tournamentCode;
}

const tournamentFullEvent = (data) => {
    console.log("TOURNAMENT FULL: ", data);
	console.log("creator: ", creator, ", globalSocket: ", globalSocket)
	if (creator === globalSocket.id)
		document.getElementById("startButtonTournament").display = 'block';
}

const tournamentPlayerListEvent = (data) => {
	if (nbPlayer !== null && nbPlayer > data.length)
	{
		nbPlayer = data.length;
		// if (creator === globalSocket.id) // enlever le start quand ya un pelo qui se casse 
		// 	document.getElementById("startButtonTournament").display = 'block';
		usersInTournament(data, true);
	}
	else
	{
		nbPlayer = data.length;
		usersInTournament(data, false);
	}
}

const tournamentMatchEvent = (data) => {

	tournamentAllUsers.users = data.team1;
	tournamentAllUsers.users = data.team2;
}

// const tournamentMatchesEvent = (data) => {
//     console.log("TOURNAMENT MATCHES: ", data);
// }

const startTournamentGameEvent = async (data) => {
    console.log("START TOURNANT Game")
    const module = await import('../pong/pong.js');
    ELEMENTs.allPage().innerHTML = "";
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/lobbyPage/luffyBoat.png')";
    await module.main(data.gameCode, globalSocket, currentLanguage);
    console.log("Tournament End");
}

const tournamentWinnerEvent = (data) => {
    console.log("TOURNAMENT WINNER: ", data);
    winnerOfTournament = data;
    refreshWinner(winnerOfTournament);
    setTimeout(() => {
        replace_location(URLs.VIEWS.HOME);
        console.log("PASS The 10 second");
    }, 20000);
}


// const errorTournamentEvent = (data) => {
// 	console.log("ERROR TOURNAMENT: ", data);
//     error = data.message;
// }

function refreshWinner(winnerOfTournament) {
    const maxAttempts = 10;
    let attempts = 0;
    
    const tryUpdateWinner = () => {
        const winnerElement = document.getElementById("winnerOfTheTournament");
        if (winnerElement) {
            console.log("winnerElement: ", winnerElement);
            winnerElement.innerHTML = winnerOfTournament;
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryUpdateWinner, 1000);
        }
    };
    tryUpdateWinner();
}

async function joinTournament(code)
{
    console.log("JOIN TOURNAMENT");
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
    console.log("CREATE TOURNAMENT");
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
			ELEMENTs.numbersOfPlayersTournament().innerHTML = nbPlayer;

		if (disconnect === false && ELEMENTs.numbersOfPlayersTournament())
		{
			console.log("usernameTournament: ", usernameTournament);

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
		else if (ELEMENTs.numbersOfPlayersTournament())
		{
			tournamentAllUsers.forEach(element => {
				console.log("usernameTournament: dans le suppr", usernameTournament, ", et element: ", element);
				const isUsernamePresent = usernameTournament.some(item => Object.values(item).includes(element)); // si il trouve pas alors je le tej et banger
				console.log("isUsernamePresent: ", isUsernamePresent);
				// if (function(usernameTournament).includes(element))
				// 	{   
				// 		console.log("dans la boucle remove    element: ", element);
				// 		removeUserTournament(element);
				// 	}
				});
		}
	}, 20);
}

async function addUserTournament(usernameTournament)
{
    const div = document.createElement("div");
    div.className = "tournamentPlayer";
	div.id = `userTournament${nbPlayer}`;
    const p = document.createElement("p");
    p.innerHTML = usernameTournament;
    p.className = "usernameTournament";
    div.appendChild(p);
	ELEMENTs.tournamentContent().appendChild(div);
}


async function removeUserTournament(usernameTournament)
{
	const div = document.querySelector(`#userTournament${usernameTournament}`); // marche pas je pense

	if (div)
		div.remove();
	tournamentAllUsers.removeUser(usernameTournament);
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
	// if (winner)
	// {
	// 	document.getElementById("winnerOfTheTournament").innerHTML = winner;
	// 	winner = null;
	// }
    document.getElementById('startButtonTournament').onclick = () => startTournament();
}

function startTournament()
{
    console.log("start tournament");
    globalSocket.emit('tournamentStart', savedTournamentCode.code);
	setTimeout(() => {
		if (error !== null)
		{
			error = null;
			return ;
		}
	}, 20);
}