
async function joinLobbyGame(gameCode, teamID, role) // surement possible de faire une seule fonction pour les deux join
{
    console.log(" join lobby");

    if (nbPerTeam == 2)
    {
        ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR; // TODO surement a mettre apres le confirmChoices 
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }
    else
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    console.log("user dans joinLobbyGame: ", user, "gameCode: ", gameCode, "teamID: ", teamID, "role: ", role);
    globalSocket.emit('confirmChoices', { teamID: teamID, role: role, userName: user.username });
    if (error !== null)
    {
        console.log("error: ", error);
        error = null;
        window.history.pushState({}, "", URLs.VIEWS.HOME);
        handleLocation();
        return ;
    }
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