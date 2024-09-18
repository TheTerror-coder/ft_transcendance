
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
        const password1 = document.getElementById('createPassword').value;
        const password2 = document.getElementById('createConfirmPassword').value;
        

        parsingCreateAccount(username, email, password, confirmPassword);

<<<<<<< HEAD


        if (password1 === password2) {
=======
        // faire un parsing
        if (password === confirmPassword) // verif s'il n'existe pas deja dans la base de donnee
        {
>>>>>>> origin/dbaule
            alert('Form is valid and passwords match! Submitting...');
            // Uncomment the line below to actually submit the form
            // this.submit();
            // var tgben = hashStringSHA256(email);
            // hashStringSHA256(email).then(hashed);

            console.log(registerURL);
            fetch(registerURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
                body: new URLSearchParams({
                    'username': username,
<<<<<<< HEAD
                    'password1': password1,
                    'password2': password2,
                    // 'email': hashStringSHA256(email),
                    'email': email,
                }),
            })
            .then(reponse => reponse.json()) //reponse du form si oui ou non il est valide
            .then(reponse => console.log("caaaaacccca", reponse))
        } else {
=======
                    'password': password,
                    'confirmPassword': confirmPassword,
                    'email': email,
                }),
            })
            refreshPage();
        }
        else {
>>>>>>> origin/dbaule
            alert('Passwords do not match. Please try again.');
        }
        // hashStringSHA256(
    } else {
        // If form is not valid, show an error popup
        alert('Some of the required information is not complete.');
    }
});


<<<<<<< HEAD
async function hashStringSHA256(input) {
=======
async function hashStringSHA256(input) 
{
>>>>>>> origin/dbaule
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
<<<<<<< HEAD
  }
=======
}

function parsingCreateAccount(username, email, password, confirmPassword)
{
    let checker = 0;

    if (username.lengh > 15)
        checker++;
    if (password != confirmPassword)
        checker += 10;
    


    // alert()
}
>>>>>>> origin/dbaule
