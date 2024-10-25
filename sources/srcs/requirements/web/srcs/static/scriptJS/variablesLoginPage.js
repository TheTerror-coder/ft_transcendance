

// const loginPage = document.querySelector("#loginPage");

// FLAG
const englandFlag = document.querySelector("#englandFlag");
const spainFlag = document.querySelector("#spainFlag");
const franceFlag = document.querySelector("#franceFlag");

let flagSelected = "en";
const flag = document.querySelector("#flag");


//LOGIN PAGE information
// const loginButton = document.querySelector("#loginButton");
// const woodPresentation = document.querySelector("#woodPresentation");
// const background = document.querySelector("#background");


// // CONNEXION VARIABLE
// const buttonConnectionAPI42 = document.querySelector("#connectionApi");
// const buttonConnec = document.querySelector("#connectionEmail");
// const buttonCreateAccount = document.querySelector("#createAnAccount");

// const createAccountChange = document.querySelector("#formAccount");


// const formConnect = document.querySelector("#formConnect");


// let createAccountForm;


// // "refresh" page variable
// const buttonRefreshPage = document.querySelector('#refreshPage');



class loginPage {
    constructor() {
        loginPageDisplayVAR = `<div class="loginPage" id="loginPage">

            <div class="loginButton" id="loginButton">
                <button id="refreshPage"><img src="../media/photos/picturePng/loginPage/onePong.png" alt="ONE PONG" style="min-width: 450px; min-height: 160px;"></button>
            </div>
            <div class="woodPresentation" id="woodPresentation">
                <img src="../media/photos/picturePng/loginPage/woodPresentation.png" alt="woodPresentation" style="margin-top: auto;">
                <div class="woodPresentationContent" id="connect">
                    <button class="fontConnexionWith42" id="connectionApi">CONNECTION API <img src="../media/photos/picturePng/logo42.png" alt="42-logo"  class="logo42"></button>
                    <button class="fontConnexion" id="connectionEmail"  style="margin-top: -8px;">CONNECTION</button>
                    <button class="fontConnexion" id="createAnAccount" style="margin-top: -7px;">CREATE AN ACCOUNT</button>
                    
                    
                    <form class="createAccount" id="formConnect">
                        {% csrf_token %}
                        <p class="fontConnexion">
                            <input id="username" type="username" class="form-control" placeholder="Username" aria-label="Username" style="font-family: arial" required>
                        </p>
                        <p class="fontConnexion">
                            <input id="password" type="password" class="form-control" placeholder="Password" aria-label="Username" style="font-family: arial;" required>
                        </p>
                        <button class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">CONFIRM</button>
                    </form>
                    <form class="createAccount" id="formAccount">
                        {% csrf_token %}
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
    }
}

