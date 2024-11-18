function profileDisplay() 
{
    window.history.pushState({}, "", "/profile");
    handleLocation();
}


function friendDisplay(homePage)
{
    homePage.addFriend.style.display = "block";
    homePage.friendButton.style.display = "none";
}
