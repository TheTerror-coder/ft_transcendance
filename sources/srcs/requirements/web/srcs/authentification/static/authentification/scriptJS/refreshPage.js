
buttonRefreshPage.onclick = refreshPage;

function refreshPage()
{
    if (createAccountChange.style.display == 'flex') 
        createAccountChange.style.display = 'none';
    else if (formConnect.style.display == 'flex')
        formConnect.style.display = 'none'
    buttonConnectionAPI42.style.display = 'block';
    buttonConnec.style.display = 'block';
    buttonCreateAccount.style.display = 'block';
}

