let mainPage;

function putFormRegister()
{
    ELEMENTs.signInWith42Button().style.display = 'none';
    ELEMENTs.buttonConnec().style.display = 'none';
    ELEMENTs.buttonCreateAccount().style.display = 'none';
    ELEMENTs.createAccountChange().style.display = 'flex';
}

function putFormConnect()
{
    ELEMENTs.signInWith42Button().style.display = 'none';
    ELEMENTs.buttonConnec().style.display = 'none';
    ELEMENTs.buttonCreateAccount().style.display = 'none';
    ELEMENTs.formConnect().style.display = 'flex';
}

const loginPageDisplayVAR = 
`<div class="loginPage" id="loginPage">
    <div id="loginButton" style="display: flex;align-items: center;justify-content: center;">
        <button class="loginButton"><img id="refreshPage" src="/static/photos/picturePng/loginPage/onePong.png" alt="ONE PONG" style="min-width: 450px; min-height: 160px;"></button>
    </div>
    <div class="woodPresentation" id="woodPresentation">
        <img src="/static/photos/picturePng/loginPage/woodPresentation.png" alt="woodPresentation" style="margin-top: auto;">
        <div class="woodPresentationContent" id="connect">
            <button data-translate="42SignIn" class="fontConnexionWith42" id="signInWith42Button" type="button"> SIGN IN WITH <img src="/static/photos/picturePng/logo42.png" alt="42-logo"  class="logo42"></button>
            <button data-translate="SignIn" class="fontConnexion" id="connectionEmail"  style="margin-top: -8px;">CONNECTION</button>
            <button data-translate="CreateAccount" class="fontConnexion" id="createAnAccount" style="margin-top: -7px;">CREATE AN ACCOUNT</button>
            <form class="createAccount" id="formConnect">
                <p class="fontConnexion">
                    <input id="email" type="email" class="form-control" placeholder="email" aria-label="Email" style="font-family: arial" required>
                </p>
                <p class="fontConnexion">
                    <input data-translate="placeholderPassword" id="password" type="password" class="form-control" placeholder="Password" aria-label="Username" style="font-family: arial;" required>
                </p>
                <button data-translate="Confirm" id="connexion-confirm-button" class="fontConfirmCreateAccount" type="submit" style="justify-content: center; margin-top: -20px; font-size: 300%;">CONFIRM</button>
            </form>
            <form class="createAccount" id="formAccount">
                <p class="fontConnexion">
                    <input id="createEmail" type="email" name="email" class="form-control" placeholder="E-mail" aria-label="Username" style="font-family: arial" required>
                </p>
                <p class="fontConnexion">
                    <input data-translate="placeholderUser" id="createUser" name="username" class="form-control" placeholder="User" aria-label="Username" style="font-family: arial" required>
                </p>
                <p class="fontConnexion" style="margin-top: -2px;">
                    <input data-translate="placeholderPassword" id="createPassword" type="password" name="password" class="form-control" placeholder="Password" aria-label="Username" style="font-family: arial;" required>
                </p>
                <p class="fontConnexion" style="margin-top: -3px;">
                    <input data-translate="placeholderConfirmPassword" id="createConfirmPassword" type="password" name="confirm_password" class="form-control" placeholder="Confirm Password" style="font-family: arial" aria-label="Username" required>
                </p>
                <button data-translate="Confirm" id="create-account-confirm-button" class="fontConfirmCreateAccount" type="submit">CONFIRM</button>
            </form>
        </div>
</div>`;