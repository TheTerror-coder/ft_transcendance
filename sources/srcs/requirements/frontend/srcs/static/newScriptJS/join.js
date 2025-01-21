
async function joinLobbyGame(gameCode, teamID, role)
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
        await replace_location(URLs.VIEWS.HOME);
        return ;
    }
    savedGameCode.code = gameCode;
	await changeMusic(ELEMENTs.lobbyMusic());
}

function joinLocalGame()
{
    console.log("local game");
    // direct lancer la game en local
}
