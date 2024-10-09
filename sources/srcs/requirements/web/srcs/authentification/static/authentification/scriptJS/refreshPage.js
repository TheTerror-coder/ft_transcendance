
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

function refreshHomePage(data)
{
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
    let usernameElement = document.querySelector("#usernameDisplay");
    if (usernameElement) {
        usernameElement.textContent = `${data.username}`;
    }
}


function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}

// function that catch when you click on the refresh button

window.addEventListener('beforeunload', function (e) {
    // Delete all cookies
    deleteAllCookies();
    
    // Log to console (note: this might not be visible due to page unload)
    console.log("All cookies deleted");

    // Uncomment the next line if you want to show a confirmation dialog
    // e.returnValue = 'Are you sure you want to leave?';
});