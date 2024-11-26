


function createLobbyDisplay() 
{
    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
    else
    {
        createLobbyforTwoPlayer();
    }
    const crossButton = document.getElementById("crossButton");
    crossButton.onclick = () => refreshHomePage();
}

function createLobbyforTwoPlayer()
{
    ELEMENTs.contentCreateLobby().innerHTML = TeamAndRoleTwoPlayerLobbyVAR;
    setTimeout(() => {
        ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
        ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
    
        ELEMENTs.buttonCreate().onclick = () => lobbyTwoPlayer();
        const crossButton = document.getElementById("crossButton");
        crossButton.onclick = () => refreshHomePage();
    }, 40);
}


function lobbyTwoPlayer()
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().value;
    const roleChosen = ELEMENTs.chooseRoleSwitch().value;

    console.log("team chosen: ", teamChosen);
    console.log("role chosen: ", roleChosen);
    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;

    setTimeout(() => {
        const crossButton = document.getElementById("crossButton");
        crossButton.onclick = () => refreshHomePage();
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }, 70);

}


function switchRole()
{
    if (ELEMENTs.chooseRoleSwitch().checked == true)
    {
        ELEMENTs.helmsmanRoleDisplay().style.transition = "filter 0.5s ease";
        ELEMENTs.helmsmanRoleDisplay().style.filter = "blur(2px)";
        ELEMENTs.gunnerRoleDisplay().style.filter = "none";
    }
    else
    {
        
        ELEMENTs.helmsmanRoleDisplay().style.filter = "none";
        ELEMENTs.gunnerRoleDisplay().style.transition = "filter 0.5s ease";
        ELEMENTs.gunnerRoleDisplay().style.filter = "blur(2px)";
    }
}

function switchTeam()
{
    if (ELEMENTs.chooseTeamSwitch().checked == true)
    {
        ELEMENTs.KurohigeTeamDisplay().style.transition = "filter 0.5s";
        ELEMENTs.KurohigeTeamDisplay().style.filter = "blur(2px)";
        ELEMENTs.ShirohigeTeamDisplay().style.filter = "none";
    }
    else
    {
        
        ELEMENTs.KurohigeTeamDisplay().style.filter = "none";
        ELEMENTs.ShirohigeTeamDisplay().style.transition = "filter 0.5s";
        ELEMENTs.ShirohigeTeamDisplay().style.filter = "blur(2px)";
    }
}