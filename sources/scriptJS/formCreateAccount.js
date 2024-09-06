
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
        const password = document.getElementById('createPassword').value;
        const confirmPassword = document.getElementById('createConfirmPassword').value;
        
        if (password === confirmPassword) {
            alert('Form is valid and passwords match! Submitting...');
            // Uncomment the line below to actually submit the form
            // this.submit();
        } else {
            alert('Passwords do not match. Please try again.');
        }
    } else {
        // If form is not valid, show an error popup
        alert('Some of the required information is not complete.');
    }
});
