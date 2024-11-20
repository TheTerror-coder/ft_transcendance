function profileDisplay() 
{
    window.history.pushState({}, "", URLs.VIEWS.PROFILE);
    handleLocation();
}
