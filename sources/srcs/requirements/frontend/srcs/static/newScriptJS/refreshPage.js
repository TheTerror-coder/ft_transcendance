

// const test = new homePageClass();


const routes = {
    404: Page404DisplayVAR,
    "/loginPage": loginPageDisplayVAR, 
    "/homePage": homePageDisplayVAR,
    "/createLobby": CreateJoinLobbyDisplayVAR,
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
    let flag404 = 0;
    mainPage = document.getElementById("mainPage");
    mainPage.innerHTML = route;
    if (path == "/loginPage")
    {
        background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";
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
    }
    if (path == "/profile")
    {

        background.style.backgroundImage = "url('/static/photos/picturePng/homePage/luffyBackground.png')";

    }
    if (path == "/createLobby")
    {
        const lobby = new CreateJoinLobbyClass();
        lobby.buttonCreateLobby.onclick = () => CreateLobbyDisplay(lobby);
        // verifier si le frere est connecte
        // const lobbyPage = new lobbyPageClass();
        // lobbyPage.crossButton.onclick = () => handleLocation();
        // lobbyPage.playButtonInLobby.onclick = () => handleLocation();
    }
    if (path == "/")
    {
        window.history.pushState({}, "", "/loginPage");
        flag404 = 1;
        handleLocation();
    }
    if (route == Page404DisplayVAR && flag404 == 0)
    {
        background.style.backgroundImage = "url('/static/photos/picturePng/404Page/Background404.jpeg')";
        mainPage.style.display = "flex";
        mainPage.style.justifyContent = "center";
        mainPage.style.alignItems = "center";
    }
};

window.onpopstate = handleLocation;
// window.route = route;

handleLocation();
