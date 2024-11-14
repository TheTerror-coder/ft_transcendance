

// const test = new homePageClass();

function refreshHomePage()
{
    window.history.pushState({}, "", "/homePage");
    handleLocation();
}


const routes = {
    404: "chelou",
    "/loginPage": loginPageDisplayVAR, 
    "/homePage": homePageDisplayVAR,
    "/lobby": CreateJoinLobbyDisplayVAR,
    "/profile": profilePageDisplayVAR,
};

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    console.log("test: event " + event);
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};


const handleLocation = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes[404];
    mainPage = document.getElementById("mainPage");
    mainPage.innerHTML = route;
    if (path == "/")
    {
        window.history.pushState({}, "", "/loginPage");
        handleLocation();
    }
    if (path == "/loginPage")
    {
        const instance = new loginPageClass();
        instance.buttonConnec.onclick = () => putFormConnect(instance);
        instance.buttonCreateAccount.onclick = () => putFormCreateAccount(instance);
        instance.buttonRefreshPage.onclick = () => handleLocation();
        instance.formConnect.onsubmit = connect;
    }
    if (path == "/homePage")
    {
        // verifier si le frere est connecte
        const homePage = new homePageClass();
        flag.className = "homepageFlag";
        flag.id = 'homepageFlag';
        // homePage.rebeccaImg.style.display = 'block';
        let englandFlagImg = document.querySelector("#englandFlagImg");
        englandFlagImg.className = "englandFlag";
        englandFlag.style.marginRight = "-0.01px";
        homePage.playButtonImg.onclick = () => playDisplayHomepage(homePage);
        homePage.wantedProfile.onclick = () => profileDisplay();
        // homePage.buttonFriend.onclick = () => friendDisplay(homePage);
    }
    if (path == "/profile")
    {

        background.style.backgroundImage = "url('../static/photos/picturePng/homePage/luffyBackground.png')";
        
    }
    if (path == "/lobby")
        {
            const lobby = new CreateJoinLobbyClass();
            lobby.buttonCreateLobby.onclick = () => CreateLobbyDisplay(lobby);
        // verifier si le frere est connecte
        // const lobbyPage = new lobbyPageClass();
        // lobbyPage.crossButton.onclick = () => handleLocation();
        // lobbyPage.playButtonInLobby.onclick = () => handleLocation();
    }
};

window.onpopstate = handleLocation;
// window.route = route;

handleLocation();
