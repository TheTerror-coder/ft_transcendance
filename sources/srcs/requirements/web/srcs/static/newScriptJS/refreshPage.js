

const instance = new loginPageClass();
const test = new homePageClass();

const routes = {
    404: "chelou",
    "/": instance.loginPageDisplayVAR,   
    "/homePage": test.homePageDisplayVAR,
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
    document.getElementById("mainPage").innerHTML = route;
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();


