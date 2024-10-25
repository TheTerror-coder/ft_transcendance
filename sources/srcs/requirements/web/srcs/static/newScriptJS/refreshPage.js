const routes = {
    404: "/templates/404.html",
    "/": "../../../../../login.html",
    "/homePage": "homePage.html",
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
    const html = await fetch(route).then((data) => data.text());
    document.getElementById("mainPage").innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();


