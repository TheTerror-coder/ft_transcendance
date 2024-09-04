
//onCLICK

buttonRefreshPage.onclick = refreshPage;

// FLAG





// CONNEXION

buttonConnectionAPI42.onclick = connectAPI42;
buttonCreateAccount.onclick = createAnAccount;

function connectAPI42()
{
    buttonConnectionAPI42.innerHTML = "LOLOLOL";
}

function connectEmail()
{

}

function createAnAccount()
{
    // il faut tej les bouton et limite rajouter un bouton retour pour revenir en arriere
    // il faudra enlever le display des boutton
    if (flagSelected === "en")
    {
        // buttonConnectionAPI42.style.visibility = 'hidden';
        // buttonConnecEmail.style.visibility = 'hidden';
        // buttonCreateAccount.style.visibility = 'hidden';
        buttonConnecEmail.innerHTML = "";
        buttonConnectionAPI42.innerHTML = "";
        buttonCreateAccount.innerHTML = "";
        createAccountForm =
        `<div class="createAccount";>
            <p class="fontConnexion"><input id="email" type="email" class="form-control" placeholder="E-mail" aria-label="Username" style="font-family: arial" required></p>
            <p class="fontConnexion"><input id="password" type="password" class="form-control" placeholder="Password" aria-label="Username" style="font-family: arial" required></p>
            <p class="fontConnexion"><input id="confirmPassword" type="password" class="form-control" placeholder="Confirm Password"  style="font-family: arial" aria-label="Username"required></p>
            <button class="fontConnexion" type="submit" style="justify-content: center; margin-top: -20px;">CONFIRM</button>
        </div>`;
        let inputEmail = document.getElementById("email");
        let inputpassword = document.querySelector("#password");
        let inputConfirmPassword = document.querySelector("#confirmPassword");

        // faut attendre le resultat du formulaire lol !! il faudra faire une verif avec le confirm password
        // email = inputEmail.value;
        // password = inputpassword.value;
        createAccountChange.insertAdjacentHTML('afterbegin', createAccountForm);
    }
}

function refreshPage()
{
    if (createAccountForm)
    {
        createAccountChange.innerText = "";
        buttonConnectionAPI42 = document.getElementById('connectionApi');
        buttonConnecEmail = document.getElementById('connectionEmail');
        buttonCreateAccount = document.getElementById('createAnAccount');
        buttonConnectionAPI42.innerText = `<button class="fontConnexion" id="connectionApi">CONNECTION API 
        <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:  -10px;">
        </button>`;
        buttonConnecEmail.innerText = `<button class="fontConnexion" id="connectionEmail"  style="margin-top: -5px;">CONNECTION E-MAIL</button>`;
        buttonCreateAccount.innerText = `<button class="fontConnexion" id="createAnAccount" style="margin-top: -10px;">CREATE AN ACCOUNT</button>`;


        buttonConnectionAPI42.onclick = connectAPI42;
        buttonCreateAccount.onclick = createAnAccount;
    }
}
