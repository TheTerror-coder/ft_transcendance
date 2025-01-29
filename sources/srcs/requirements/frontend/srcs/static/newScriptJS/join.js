
async function joinLobbyGame(gameCode, teamID, role)
{
	if (!await isUserAuthenticated({}))
		replace_location(URLs.VIEWS.LOGIN_VIEW);
    if (nbPerTeam == 2)
    {
        ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }
    else
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    globalSocket.emit('confirmChoicesJoinGame', { teamID: teamID, role: role, userName: user.username, gameCode: gameCode});
    if (error !== null)
    {
        error = null;
        return ;
    }
    savedGameCode.code = gameCode;
	await changeMusic(ELEMENTs.lobbyMusic());
}