function profileDisplay(homePage) 
{
    window.history.pushState({}, "", "/profile");
    handleLocation();
}