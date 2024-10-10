
// buttonConnectionAPI42.onclick = connectAPI42;
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
    // Prevent the form from submitting immediately
    event.preventDefault();



    // Check if the form is valid
    if (this.checkValidity()) {
        // Additional validation: check if passwords match

        const email = document.getElementById('createEmail').value;
        const username = document.getElementById('createUser').value;
        const picture = document.getElementById('createPicture').value;
        const password = document.getElementById('createPassword').value;
        const confirmPassword = document.getElementById('createConfirmPassword').value;
        

        parsingCreateAccount(username, email, password, confirmPassword);

        // faire un parsing
        if (password === confirmPassword) // verif s'il n'existe pas deja dans la base de donnee
        {
            // Uncomment the line below to actually submit the form
            // this.submit();
            // var tgben = hashStringSHA256(email);
            // hashStringSHA256(email).then(hashed);
            
            console.log("slt", registerURL);
            fetch(registerURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
                body: new URLSearchParams({
                    'username': username,
                    'photo': picture,
                    'password1': password,
                    'password2': confirmPassword,
                    'email': email,
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status === 'success') {
                    alert('Form is valid and passwords match! Submitting...');
                    connecting(username, password);
                } 
                else if (data.status === 'error') {
                    if (typeof data.errors === 'object') {
                        let errorMessages = '';
                        for (let key in data.errors) {
                            if (data.errors.hasOwnProperty(key)) {
                                errorMessages += `${key}: ${data.errors[key]}\n`;
                            }
                        }
                        alert(errorMessages);
                        console.log("Errors:", errorMessages);
                    } else {
                        alert(data.errors);
                        console.log("Errors:", data.errors);
                    }
                }
            });
        }
        else {
            alert('Passwords do not match. Please try again.');
        }
        // hashStringSHA256(
    } else {
        // If form is not valid, show an error popup
        alert('Some of the required information is not complete.');
    }
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
