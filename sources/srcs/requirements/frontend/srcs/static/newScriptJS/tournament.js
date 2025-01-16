
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

async function joinTournament()
{
    const socket = await initializeSocket();
    initializeTournamentGlobalSocket(socket);
    console.log("JOIN TOURNAMENT");
    ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
    tournamentCodeJS = "1234";
    console.log("tournamentCodeJS : ", tournamentCodeJS);
    // for (let i = 0; i < 7; i++)
    // {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // globalSocket.emit('joinTournament', {teamName: "ben" + i, tournamentCode: tournamentCodeJS});
    // }
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('joinTournament', {teamName: user.username, tournamentCode: tournamentCodeJS});
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
}
