

// CONNEXION VARIABLE
const buttonConnectionAPI42 = document.querySelector("#connectionApi");
const buttonConnecEmail = document.querySelector("#connectionEmail");
const buttonCreateAccount = document.querySelector("#createAnAccount");





// FLAG

const englandFlag = document.querySelector("#englandFlag");
const spainFlag = document.querySelector("#spainFlag");
const franceFlag = document.querySelector("#franceFlag");

englandFlag.onclick = translateEnglish;
spainFlag.onclick = translateSpanish;
franceFlag.onclick = translateFrench;

let flagSelected = "en";

function translateEnglish()
{
    if (flagSelected != "en")
    {
        const stringConnexion = `CONNECTION API <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:-10px;">`
        buttonConnectionAPI42.innerHTML = stringConnexion;
        buttonConnecEmail.innerHTML = "CONNECTION E-MAIL";
        buttonCreateAccount.innerHTML = "CREATE AN ACCOUNT";
        flagSelected = "en";
    }
}
function translateSpanish()
{
    if (flagSelected != "es")
    {
        const stringConnexion = `CONEXION API <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:-10px;">`
        buttonConnectionAPI42.innerHTML = stringConnexion;
        buttonConnecEmail.innerHTML = "CONEXION E-MAIL";
        buttonCreateAccount.innerHTML = "CREAR UNA CUENTA";
        flagSelected = "es";
    }
}

function translateFrench()
{
    if (flagSelected != "fr")
    {
        const stringConnexion = `CONNEXION API <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:-10px;">`
        buttonConnectionAPI42.innerHTML = stringConnexion;
        buttonConnecEmail.innerHTML = "CONNEXION E-MAIL";
        buttonCreateAccount.innerHTML = "CREER UN COMPTE";
        flagSelected = "fr";
    }
}



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
    buttonConnectionAPI42.innerHTML = "E-mail: ";
    buttonConnecEmail.innerHTML = "Mot de passe: ";
    buttonCreateAccount.innerHTML = "valider";
}