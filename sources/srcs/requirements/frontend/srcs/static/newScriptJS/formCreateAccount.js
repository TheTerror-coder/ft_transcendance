
// signInWith42Button.onclick = connectAPI42;
// buttonCreateAccount.onclick = createAnAccount;

// function createAnAccount()
// {
//     if (flagSelected === "en")
//     {
//         signInWith42Button.style.display = 'none';
//         buttonConnec.style.display = 'none';
//         buttonCreateAccount.style.display = 'none';
//         createAccountChange.style.display = 'flex'; 
//     }
// }



async function createAccount(instance) {
    // Prevent the form from submitting immediately
    event.preventDefault();

    const email = document.getElementById('createEmail').value;
    const username = document.getElementById('createUser').value;
    const password = document.getElementById('createPassword').value;
    const confirmPassword = document.getElementById('createConfirmPassword').value;
    console.log('createAccount() function: email: ', email,"\nusername: ", username, "\npassword: ",password, "\nconfirmPassword: ", confirmPassword);
    const data = {"username": username, "email": email, "password1": password, "password2": confirmPassword};

    parsingCreateAccount(username, email, password, confirmPassword);

        // faire un parsing
    if (password === confirmPassword) // verif s'il n'existe pas deja dans la base de donnee
    {
        console.log("registerURL", data);
        const response = await makeRequest('POST', URLs.USERMANAGEMENT.REGISTER, data);
        console.log('response', response);

    //         .then(response => response.json())
    //         .then(data => {
    //             console.log(data);
    //             if (data.status === 'success') {
    //                 alert('Form is valid and passwords match! Submitting...');
    //                 // connecting(username, password);
    //             } 
    //             else if (data.status === 'error') {
    //                 if (typeof data.errors === 'object') {
    //                     let errorMessages = '';
    //                     for (let key in data.errors) {
    //                         if (data.errors.hasOwnProperty(key)) {
    //                             errorMessages += `${key}: ${data.errors[key]}\n`;
    //                         }
    //                     }
    //                     alert(errorMessages);
    //                     console.log("Errors:", errorMessages);
    //                 } else {
    //                     alert(data.errors);
    //                     console.log("Errors:", data.errors);
    //                 }
    //             }
    //         });
    //     }
    //     else {
    //         alert('Passwords do not match. Please try again.');
    }
    //     // hashStringSHA256(
};


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
