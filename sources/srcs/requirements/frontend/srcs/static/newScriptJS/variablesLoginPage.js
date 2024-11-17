let mainPage;



const englandFlag = document.querySelector("#englandFlag");
const spainFlag = document.querySelector("#spainFlag");
const franceFlag = document.querySelector("#franceFlag");
const flag = document.querySelector("#flag");

let flagSelected = "en";



// const loginPage = document.querySelector("#loginPage");

// const loginButton = document.querySelector("#loginButton");
// const woodPresentation = document.querySelector("#woodPresentation");
// const background = document.querySelector("#background");

// const signInWith42Button = document.querySelector("#connectionApi");
// const buttonConnec = document.querySelector("#connectionEmail");
// const buttonCreateAccount = document.querySelector("#createAnAccount");

// const createAccountChange = document.querySelector("#formAccount");


// const formConnect = document.querySelector("#formConnect");


// let createAccountForm;

// const buttonRefreshPage = document.querySelector('#refreshPage');

function putFormConnect()
{
    ELEMENTs.signInWith42Button().style.display = 'none';
    ELEMENTs.buttonConnec().style.display = 'none';
    ELEMENTs.buttonCreateAccount().style.display = 'none';
    ELEMENTs.formConnect().style.display = 'flex';
}

const loginPageDisplayVAR = 
`<div class="loginPage" id="loginPage">

    <div class="loginButton" id="loginButton">
        <button id="refreshPage"><img src="/static/photos/picturePng/loginPage/onePong.png" alt="ONE PONG" style="min-width: 450px; min-height: 160px;"></button>
    </div>
    <div class="woodPresentation" id="woodPresentation">
        <img src="/static/photos/picturePng/loginPage/woodPresentation.png" alt="woodPresentation" style="margin-top: auto;">
        <div class="woodPresentationContent" id="connect">
            <button class="fontConnexionWith42" id="signInWith42Button" type="button"> SIGN IN WITH <img src="/static/photos/picturePng/logo42.png" alt="42-logo"  class="logo42"></button>
            <button class="fontConnexion" id="connectionEmail"  style="margin-top: -8px;">CONNECTION</button>
            <button class="fontConnexion" id="createAnAccount" style="margin-top: -7px;">CREATE AN ACCOUNT</button>
            <form class="createAccount" id="formConnect">
                <p class="fontConnexion">
                    <input id="username" type="username" class="form-control" placeholder="Username" aria-label="Username" style="font-family: arial" required>
                </p>
                <p class="fontConnexion">
                    <input id="password" type="password" class="form-control" placeholder="Password" aria-label="Username" style="font-family: arial;" required>
                </p>
                <button id="connexion-confirm-button" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">CONFIRM</button>
            </form>
            <form class="createAccount" id="formAccount">
                <p class="fontConnexion">
                    <input id="createEmail" type="email" name="email" class="form-control" placeholder="E-mail" aria-label="Username" style="font-family: arial" required>
                </p>
                <p class="fontConnexion">
                    <input id="createUser" name="username" class="form-control" placeholder="User" aria-label="Username" style="font-family: arial" required>
                </p>
                <p class="fontConnexion" style="margin-top: -2px;">
                    <input id="createPassword" type="password" name="password" class="form-control" placeholder="Password" aria-label="Username" style="font-family: arial;" required>
                </p>
                <p class="fontConnexion" style="margin-top: -3px;">
                    <input id="createConfirmPassword" type="password" name="confirm_password" class="form-control" placeholder="Confirm Password" style="font-family: arial" aria-label="Username" required>
                </p>
                <button class="fontConfirmCreateAccount" type="submit">CONFIRM</button>
            </form>
        </div>
</div>`;


class loginPageClass {
    constructor() 
    {
        background.style.backgroundImage = "url(/static/photos/picturePng/loginPage/landscapeOnePiece.png)";
        this.loginPage = document.getElementById("loginPage");

        
        this.loginButton = document.getElementById("loginButton");
        this.woodPresentation = document.getElementById("woodPresentation");
        this.background = document.getElementById("background");
        
        this.signInWith42Button = document.getElementById("connectionApi");
        
        this.createAccountChange = document.getElementById("formAccount");
        
        this.formConnect = document.getElementById("formConnect");

        this.buttonRefreshPage = document.getElementById('refreshPage');
        this.buttonConnec = document.getElementById("connectionEmail");
    }
}
