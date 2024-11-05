

// const test = new homePageClass();

const routes = {
    404: "chelou",
    "/": loginPageDisplayVAR,   
    "/homePage": homePageDisplayVAR,
    "/lobby": "/templates/lobby.html",
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
    console.log("test: path " + path);
    const route = routes[path] || routes[404];
    mainPage = document.getElementById("mainPage");
    console.log(route);
    mainPage.innerHTML = route;
    if (path == "/")
    {
        const instance = new loginPageClass();
        instance.buttonConnec.onclick = () => putFormConnect(instance);
        instance.buttonCreateAccount.onclick = () => putFormCreateAccount(instance);
        instance.buttonRefreshPage.onclick = () => handleLocation();
        instance.formConnect.onsubmit = connect;
    }
    if (path == "/homePage")
    {
        const homePage = new homePageClass();
        background.style.backgroundImage = "url('../static/photos/picturePng/homePage/landscapeMenu.png')";
        flag.className = "homepageFlag";
        flag.id = 'homepageFlag';
        homePage.rebeccaImg.style.display = 'block';
        let englandFlagImg = document.querySelector("#englandFlagImg");
        englandFlagImg.className = "englandFlag";
        englandFlag.style.marginRight = "-0.01px";

    }
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
