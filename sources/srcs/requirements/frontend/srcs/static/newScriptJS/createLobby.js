// import socketIOClient from 'socket.io-client';

let savedGameCode = null;
let gameStarted = false;
let ip;
let socket;

function createLobbyDisplay() 
{
    if (ELEMENTs.switchNumbersOfPlayers().checked == false)
        ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;
    else
    {
        createLobbyforTwoPlayer();
    }
    setLanguage(currentLanguage);
}

function createLobbyforTwoPlayer()
{
    ELEMENTs.contentCreateLobby().innerHTML = TeamAndRoleTwoPlayerLobbyVAR;
    setTimeout(() => {
        ELEMENTs.chooseTeamSwitch().onclick = () => switchTeam();
        ELEMENTs.chooseRoleSwitch().onclick = () => switchRole();
        console.log("juste avant le onclick de buttoncreate");
        ELEMENTs.buttonCreate().onclick = () => lobbyTwoPlayer();
    }, 60);
    setLanguage(currentLanguage);
}


function lobbyTwoPlayer()
{
    const teamChosen = ELEMENTs.chooseTeamSwitch().value;
    const roleChosen = ELEMENTs.chooseRoleSwitch().value;

    console.log("team chosen: ", teamChosen);
    console.log("role chosen: ", roleChosen);
    ELEMENTs.mainPage().innerHTML = lobbyTwoPlayerDisplayVAR;

    setTimeout(() => {
        ELEMENTs.centerLobbyDisplay().style.marginLeft = "0px";
        ELEMENTs.centerLobbyDisplay().style.marginRight = "0px";
    }, 60);
    setLanguage(currentLanguage);

}


function switchRole()
{
    if (ELEMENTs.chooseRoleSwitch().checked == true)
    {
        ELEMENTs.helmsmanRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.gunnerRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.helmsmanRoleDisplay().style.opacity = "0.3";
        ELEMENTs.gunnerRoleDisplay().style.opacity = "0.9";
    }
    else
    {
        
        ELEMENTs.helmsmanRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.helmsmanRoleDisplay().style.opacity = "0.9";
        ELEMENTs.gunnerRoleDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.gunnerRoleDisplay().style.opacity = "0.3";
    }
}

function switchTeam()
{
    const kurohige = document.getElementById("KurohigeTeam");
    if (ELEMENTs.chooseTeamSwitch().checked == true)
    {
        kurohige.style.opacity = "0.3";
        kurohige.style.transition = "opacity 0.5s ease";
        ELEMENTs.ShirohigeTeamDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.ShirohigeTeamDisplay().style.opacity = "0.9";

    }
    else
    {
        kurohige.style.transition = "opacity 0.5s ease";
        kurohige.style.opacity = "0.9";
        ELEMENTs.ShirohigeTeamDisplay().style.transition = "opacity 0.5s ease";
        ELEMENTs.ShirohigeTeamDisplay().style.opacity = "0.3";
    }
}