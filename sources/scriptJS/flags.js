


englandFlag.onclick = translateEnglish;
spainFlag.onclick = translateSpanish;
franceFlag.onclick = translateFrench;


function translateEnglish()
{
    if (createAccountForm)
        createAccountChange.innerHTML = "";
    if (flagSelected != "en")
    {
        const stringConnexion = `CONNECTION API <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:-10px;">`
        buttonConnectionAPI42.innerHTML = stringConnexion;
        buttonConnec.innerHTML = "CONNECTION";
        buttonCreateAccount.innerHTML = "CREATE AN ACCOUNT";
        flagSelected = "en";
    }
}
function translateSpanish()
{
    if (createAccountForm)
        createAccountChange.innerHTML = "";
    if (flagSelected != "es")
    {
        const stringConnexion = `CONEXION API <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:-10px;">`
        buttonConnectionAPI42.innerHTML = stringConnexion;
        buttonConnec.innerHTML = "CONEXION";
        buttonCreateAccount.innerHTML = "CREAR UNA CUENTA";
        flagSelected = "es";
    }
}

function translateFrench()
{
    if (createAccountForm)
        createAccountChange.innerHTML = "";
    if (flagSelected != "fr")
    {
        const stringConnexion = `CONNEXION API <img src="picturePng/logo42.png" alt="42-logo" style="margin-top:-10px;">`
        buttonConnectionAPI42.innerHTML = stringConnexion;
        buttonConnec.innerHTML = "CONNEXION";
        buttonCreateAccount.innerHTML = "CREER UN COMPTE";
        flagSelected = "fr";
    }
}
