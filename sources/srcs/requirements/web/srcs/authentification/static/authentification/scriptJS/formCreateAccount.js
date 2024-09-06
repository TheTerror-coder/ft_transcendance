
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
        




        if (password1 === password2) {
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
                    'password1': password1,
                    'password2': password2,
                    // 'email': hashStringSHA256(email),
                    'email': email,
                }),
            })
            .then(reponse => reponse.json()) //reponse du form si oui ou non il est valide
            .then(reponse => console.log("caaaaacccca", reponse))
        } else {
            alert('Passwords do not match. Please try again.');
        }
    } else {
        // If form is not valid, show an error popup
        alert('Some of the required information is not complete.');
    }
});


async function hashStringSHA256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }