
buttonRefreshPage.onclick = refreshPage;

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
    checkPoint();
    background.style.backgroundImage = "url('media/photos/picturePng/homePage/landscape_menu.png')";
    loginButton.style.display = 'none';
    woodPresentation.style.display = 'none';
    flag.className = "homepageFlag";
    flag.id = 'homepageFlag';

    let englandFlagImg = document.querySelector("#englandFlagImg");
    englandFlagImg.className = "englandFlag";
    englandFlag.style.marginRight = "-0.01px";
    
    homePage.style.display = 'block';
    centerHomepage.style.display = 'flex';
}

function lobbyDisplay()
{
    videoBackground.style.display = "block";
    homePage.style.display = "none";
}
function checkPoint()
{
    window.location.hash = "#homepage";
    // Save this in localStorage as a checkpoint
    localStorage.setItem('lastSection', '#homepage');
    // deleteAllCookies();

}



    // Scroll to the last saved section on page load
window.addEventListener('load', function() {
    const lastSection = localStorage.getItem('lastSection');
    if (lastSection) {
        window.location.hash = lastSection;
    }
});


window.addEventListener('beforeunload', function (e) 
{
    const lastSection = localStorage.getItem('lastSection');
    console.log(lastSection + "c'est cehlou");
    if (lastSection) {
        console.log("LOL");
        window.location.hash = lastSection;
    }

    // Delete all cookies
    deleteAllCookies();
    
    // Log to console (note: this might not be visible due to page unload)
    console.log("All cookies deleted");

    // Uncomment the next line if you want to show a confirmation dialog
    e.returnValue = 'Are you sure you want to leave?';
});

function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}
