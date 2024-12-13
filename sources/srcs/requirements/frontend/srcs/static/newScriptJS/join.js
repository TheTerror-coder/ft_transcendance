// async function joinLobbyOnevsOne(gameCode)
// {
//     console.log("globalSocket in join lobby OnevsOne", globalSocket);
//     console.log("lobby one vs one");

//     ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;

//     const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
//     console.log("user avec await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER): ", user);
//     globalSocket.emit('confirmChoices', { teamID: 2, role: "captain", userName: user.username });
//     document.getElementById("lobbyCode").innerHTML = gameCode;

//     // si pas possible, chopper le display du lobby 1vs1 et mettre le second joueur a droite
// }

async function joinLobbyGame(gameCode, teamID, role) // surement possible de faire une seule fonction pour les deux join
{
    console.log("lobby two vs two");

    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR; // TODO surement a mettre apres le confirmChoices 
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
    ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    globalSocket.emit('confirmChoices', { teamID: teamID, role: role, userName: user.username });
    document.getElementById("lobbyCode").innerHTML = gameCode;


    // meme delire que le 1vs1 si possible d'avoir la meme page
    // sinon go get le display du lobby 2vs2 et mettre les gens en fonction du joueur
}

function joinLocalGame()
{
    console.log("local game");
    // direct lancer la game en local
}

function joinTournament()
{
    console.log("tournament");
}