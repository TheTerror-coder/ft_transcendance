
buttonCreateAccount.onclick = createAnAccount;


function createAnAccount()
{
    if (flagSelected === "en")
    {
        buttonConnectionAPI42.style.display = 'none';
        buttonConnec.style.display = 'none';
        buttonCreateAccount.style.display = 'none';

        createAccountChange.style.display = 'flex'; 
    }
}


document.getElementById('formAccount').addEventListener('submit', function(event) {
    event.preventDefault();



    if (this.checkValidity()) {

        const email = document.getElementById('createEmail').value;
        const username = document.getElementById('createUser').value;
        const password1 = document.getElementById('createPassword').value;
        const password2 = document.getElementById('createConfirmPassword').value;
        

        parsingCreateAccount(username, email, password, confirmPassword);

        if (password === confirmPassword)
        {
            alert('Form is valid and passwords match! Submitting...');

            fetch(registerURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
                body: new URLSearchParams({
                    'username': username,
                    'password': password,
                    'confirmPassword': confirmPassword,
                    'email': email,
                }),
            })
            refreshPage();
        }
        else
        	alert('Passwords do not match. Please try again.');
    }
	else
    	alert('Some of the required information is not complete.');
});


async function hashStringSHA256(input) 
{
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function parsingCreateAccount(username, email, password, confirmPassword)
{
    let checker = 0;

    if (username.lengh > 15)
        checker++;
    if (password != confirmPassword)
        checker += 10;
}
