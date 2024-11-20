function profileDisplay() 
{
    window.history.pushState({}, "", URLs.VIEWS.PROFILE);
    handleLocation();
}


function refreshHomePage()
{
    window.history.pushState({}, "", URLs.VIEWS.HOME);
    handleLocation();
}