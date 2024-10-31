

// const test = new homePageClass();

const routes = {
    404: "chelou",
    "/": loginPageDisplayVAR,   
    // "/homePage": homePageDisplayVAR,
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
    const route = routes[path] || routes[404];
    mainPage = document.getElementById("mainPage");
    mainPage.innerHTML = route;
    if (path == "/")
    {
        const instance = new loginPageClass();
        instance.buttonConnec.onclick = () => putFormConnect(instance);
        instance.formConnect.onsubmit = gang;
    }
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();

