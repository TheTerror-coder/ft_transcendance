

buttonConnec.onclick = putFormConnect;

function putFormConnect()
{
    buttonConnectionAPI42.style.display = 'none';
    buttonConnec.style.display = 'none';
    buttonCreateAccount.style.display = 'none';
    formConnect.style.display = 'flex';
}



document.getElementById('formConnect').addEventListener('submit', function(event) {
    // Prevent the form from submitting immediately
    event.preventDefault();

    // Check if the form is valid
    if (this.checkValidity()) {
        // Additional validation: check if passwords match

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        console.log(email);
        console.log(password);
        if (email && password) // ici tester avec la database
        {
            alert('connecting...');
            // document.getElementById('backgroundDiv');
            background.style.backgroundImage = "url('picturePng/homePage/landscape_menu.png')";
            loginButton.style.display = 'none';
            woodPresentation.style.display = 'none';
            flag.className = "homepageFlag";
            flag.id = 'homepageFlag';

            let englandFlagImg = document.querySelector("#englandFlagImg");
            englandFlagImg.className = "englandFlag";
            englandFlag.style.marginRight = "-0.01px";
            
            homePage.style.display = 'block';
            playButton.style.display = 'flex';
        }
        else // ici qund rien ne correspond a la database
            alert('Some of the required information is not complete.');
    }
});
