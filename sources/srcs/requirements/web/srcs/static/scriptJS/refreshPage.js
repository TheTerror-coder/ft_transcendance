
buttonRefreshPage.onclick = refreshPage;
wantedProfile.onclick = profileDisplay;


function refreshPage()
{
    document.getElementById('createEmail').value = "";
    document.getElementById('createUser').value = "";
    document.getElementById('createPassword').value = "";
    document.getElementById('createConfirmPassword').value = "";
    if (createAccountChange.style.display == 'flex')
        createAccountChange.style.display = 'none';
    else if (formConnect.style.display == 'flex')
        formConnect.style.display = 'none'
    buttonConnectionAPI42.style.display = 'block';
    buttonConnec.style.display = 'block';
    buttonCreateAccount.style.display = 'block';
    loginPage.style.display = 'block';
}

function refreshLoginPage()
{
    background.style.backgroundImage = "url('media/photos/picturePng/loginPage/landscapeOnePiece.png')";
    loginButton.style.display = 'block';
    woodPresentation.style.display = 'block';
    flag.className = "flag";
    flag.id = 'flag';

    homePage.style.display = 'none';
    centerHomepage.style.display = 'none';
}

function refreshHomePage()
{
    // checkPoint();
    background.style.backgroundImage = "url('media/photos/picturePng/homePage/landscape_menu.png')";
    loginButton.style.display = 'none';
    woodPresentation.style.display = 'none';
    flag.className = "homepageFlag";
    flag.id = 'homepageFlag';
    rebeccaImg.style.display = 'block';
    friendButton.style.display = 'flex';

    let englandFlagImg = document.querySelector("#englandFlagImg");
    englandFlagImg.className = "englandFlag";
    englandFlag.style.marginRight = "-0.01px";
    
    homePage.style.display = 'flex';
    centerHomepage.style.display = 'flex';
}

function lobbyDisplay()
{
    videoBackground.style.display = "block";
    homePage.style.display = "none";
}

function profileDisplay()
{
    rebecca.style.display = 'none';
    wantedProfile.style.display = 'none';
    // friendButton.style.display = 'flex';
    friendDisplay.style.display = 'block';
    playButton.style.display = 'none';
    flag.style.display = 'none';
    wantedInProfilePage.style.opacity = '1';
    profilePage.style.display = 'flex';
    profilePage.style.flexDirection = 'flex-end';
    wantedInProfilePage.style.display = 'block';
}

function checkPoint()
{
    window.location.hash = "#homepage";
    // Save this in localStorage as a checkpoint
    localStorage.setItem('activeSection', '#homepage');
    console.log(window.location.pathname);
    // deleteAllCookies();

}

