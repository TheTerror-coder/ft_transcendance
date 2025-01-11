
async function statsInProfilePage(game_played, victories)
{
    let percentage = 0;
    
    if (game_played > 0) {
        percentage = (victories / game_played) * 100;
    }
    
    percentage = Math.min(Math.max(percentage, 0), 100);
    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');

    percentage = Math.min(Math.max(percentage, 0), 100);

    circularProgress.style.background = `conic-gradient(
        #4caf50 0% ${percentage}%, 
        #e0e0e0 ${percentage}% 100%
    )`;

    progressValue.textContent = `${percentage}%`;
}

async function getHistoric(game)
{
    console.log("game.length: ", game.length);
    if (game.length === 0)
    {
        const match = document.createElement('div');
        match.className = 'matchDisplayHistoric';
        const result = document.createElement('span');
        result.style.alignSelf = 'center';
        if (currentLanguage === 'en')
            result.textContent = "No game played";
        else if (currentLanguage === 'fr')
            result.textContent = "Pas de parties jouees";
        else if (currentLanguage === 'es')
            result.textContent = "No se ha jugado ningún juego";
        result.dataset.translate = "NoGamePlayed";
        match.appendChild(result);
        ELEMENTs.historicMatch().appendChild(match);
        return ;
    }
    else
    {
        //if () game 1 v 1
        for (let i = 0; i < game.length; i++)
        {
            const match = document.createElement('div');
            match.className = 'matchDisplayHistoric';
            const username = document.createElement('span');
            const advUsername = document.createElement('span');
            const resultUser = document.createElement('span');
            const resultAdvUser = document.createElement('span');


            console.log("game: ", game);
            resultUser.className = 'resultDisplayHistoric';


            resultUser.textContent = game.player_score;
            resultAdvUser.textContent = game.opponent_score;
            username.textContent = game.player;
            advUsername.textContent = game.opponent;
            match.appendChild(username);
            match.appendChild(resultUser);
            match.appendChild(resultAdvUser);
            match.appendChild(advUsername);
        }
        //else game 2 v 2
    }
}

async function displayWaitingListFriend(friends) {
    const dropdownMenu = document.getElementById('waitingFriendDropdownMenu');
    console.log("friends: ", friends);

    // Vider le menu avant de le mettre à jour
    dropdownMenu.innerHTML = '';

    if (friends.length === 0) {
        const listItem = document.createElement('li');
        listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
        const nameSpan = document.createElement('span');
        if (currentLanguage === 'en')
            nameSpan.textContent = "No Invitations Waiting";
        else if (currentLanguage === 'fr')
            nameSpan.textContent = "Aucune Invitations en Attente";
        else if (currentLanguage === 'es')
            nameSpan.textContent = "No hay invitaciones en espera";
        nameSpan.dataset.translate = "NoInvitationsWaiting";
        listItem.appendChild(nameSpan);
        dropdownMenu.appendChild(listItem);
    } else {
        for (let i = 0; i < friends.length; i++) {
            const listItem = document.createElement('li');
            listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';

            const actionAddButton = document.createElement('button');
            const actionRemoveButton = document.createElement('button');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = friends[i].from_user;

            const divForButton = document.createElement('div');
            divForButton.style.display = "flex";
            divForButton.style.flexDirection = "flex-end";

            const imgButtonAdd = document.createElement("img");
            imgButtonAdd.src = "/static/photos/picturePng/profilePage/approvebutton.png";
            imgButtonAdd.alt = "Add Friend";

            const imgButtonRemove = document.createElement("img");
            imgButtonRemove.src = "/static/photos/picturePng/profilePage/crossButtonFriend.png";
            imgButtonRemove.alt = "Remove Friend";

            actionAddButton.appendChild(imgButtonAdd);
            actionRemoveButton.appendChild(imgButtonRemove);
            divForButton.appendChild(actionAddButton);
            divForButton.appendChild(actionRemoveButton);

            // Gérer l'acceptation de l'invitation
            actionAddButton.addEventListener('click', async () => {
                alert(`add ${friends[i].from_user}`);
                console.log("data.friend_request_id: ", friends[i].friend_request_id);

                // Envoi de l'invitation acceptée au serveur
                socket.send(JSON.stringify({
                    type: 'response.invitation',
                    response: 'accept',
                    friend_request_id: friends[i].friend_request_id
                }));

                // 1. Supprimer l'invitation de la liste d'attente
                dropdownMenu.removeChild(listItem);

                // 2. Mettre à jour la liste des amis (soit dynamiquement, soit via une API)
                // Exemple de mise à jour dynamique : 
                await addFriendToFriendList(friends[i]);

                // 3. Vérifier si la liste des invitations est vide après l'acceptation
                if (dropdownMenu.children.length === 0) {
                    const noInvitationsItem = document.createElement('li');
                    noInvitationsItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
                    const noInvitationsSpan = document.createElement('span');
                    noInvitationsSpan.textContent = currentLanguage === 'en' ? "No Invitations Waiting" : (currentLanguage === 'fr' ? "Aucune Invitations en Attente" : "No hay invitaciones en espera");
                    noInvitationsItem.appendChild(noInvitationsSpan);
                    dropdownMenu.appendChild(noInvitationsItem);
                }
            });

            // Gérer le rejet de l'invitation
            actionRemoveButton.addEventListener('click', () => {
                alert(`remove ${friends[i].from_user}`);
                console.log("data.friend_request_id: ", friends[i].friend_request_id);
                socket.send(JSON.stringify({
                    type: 'response.invitation',
                    response: 'reject',
                    friend_request_id: friends[i].friend_request_id
                }));

                dropdownMenu.removeChild(listItem);

                if (dropdownMenu.children.length === 0) {
                    const noInvitationsItem = document.createElement('li');
                    noInvitationsItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
                    const noInvitationsSpan = document.createElement('span');
                    noInvitationsSpan.textContent = currentLanguage === 'en' ? "No Invitations Waiting" : (currentLanguage === 'fr' ? "Aucune Invitations en Attente" : "No hay invitaciones en espera");
                    noInvitationsItem.appendChild(noInvitationsSpan);
                    dropdownMenu.appendChild(noInvitationsItem);
                }
            });

            listItem.appendChild(nameSpan);
            listItem.appendChild(divForButton);
            dropdownMenu.appendChild(listItem);
        }
    }
}


async function addFriendToFriendList(friend) {
    const friendListMenu = document.getElementById('friendDropdownMenu');
    
    if (document.getElementById("noFriends") !== null)
    {
        document.getElementById("noFriends").remove();
    }
    const listItem = document.createElement('li');
    listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';

    const buttonDisplayFriend = document.createElement('button');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = friend.from_user;

    const actionButton = document.createElement('button');
    const imgButton = document.createElement("img");
    imgButton.src = "/static/photos/picturePng/profilePage/crossButtonFriend.png";
    imgButton.alt = "removeFriend";
    imgButton.style.display = "flex";
    imgButton.style.flexDirection = "flex-end";

    const circleIsConnect = document.createElement('div');
    circleIsConnect.className = 'circleIsConnect';
    circleIsConnect.style.backgroundColor = 'green';
    circleIsConnect.style.border = '1px solid white';

    actionButton.appendChild(imgButton);

    // Ajouter l'ami à la liste des amis dans le DOM
    buttonDisplayFriend.onclick = () => UserProfileView(nameSpan.textContent);
    buttonDisplayFriend.appendChild(nameSpan);
    listItem.appendChild(circleIsConnect);
    listItem.appendChild(buttonDisplayFriend);
    listItem.appendChild(actionButton);

    // Ajouter l'ami dans la liste
    friendListMenu.appendChild(listItem);
}

async function displayFriend(friends, user_socket) {
    const dropdownMenu = document.getElementById('friendDropdownMenu');
    
    // Vider le menu avant de le mettre à jour
    dropdownMenu.innerHTML = '';

    // Vérification si la liste d'amis est vide
    if (friends.length === 0) {
        const listItem = document.createElement('li');
        listItem.id = "noFriends";
        listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = currentLanguage === 'en' ? "No friends" : (currentLanguage === 'fr' ? "Pas d'amis" : "No hay amigos");
        nameSpan.dataset.translate = "NoFriends";
        listItem.appendChild(nameSpan);
        dropdownMenu.appendChild(listItem);
    } else {
        // Ajouter chaque ami à la liste
        for (let i = 0; i < friends.length; i++) {
            const listItem = document.createElement('li');
            listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';

            const buttonDisplayFriend = document.createElement('button');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = friends[i].username;

            const actionButton = document.createElement('button');
            const imgButton = document.createElement("img");
            imgButton.src = "/static/photos/picturePng/profilePage/crossButtonFriend.png";
            imgButton.alt = "removeFriend";
            imgButton.style.display = "flex";
            imgButton.style.flexDirection = "flex-end";
            
            // Indicateur de connexion de l'ami
            const circleIsConnect = document.createElement('div');
            circleIsConnect.className = 'circleIsConnect';
            if (friends[i].username in user_socket) {
                circleIsConnect.style.backgroundColor = 'green';
                circleIsConnect.style.border = '1px solid white';
            } else {
                circleIsConnect.style.backgroundColor = 'red';
                circleIsConnect.style.border = '1px solid white';
            }

            // Ajouter l'événement pour le bouton de suppression
            actionButton.appendChild(imgButton);
            actionButton.addEventListener('click', async () => {
                try {
                    // Suppression de l'ami via une requête
                    const response = await makeRequest('POST', URLs.USERMANAGEMENT.REMOVEFRIEND, { username: friends[i].username });
                    alert(`${friends[i].username} ne fait plus partie de vos amis`);

                    // Retirer l'ami de la liste affichée
                    dropdownMenu.removeChild(listItem);

                    // Vérifier si la liste est vide après la suppression
                    if (dropdownMenu.children.length === 0) {
                        const noFriendsItem = document.createElement('li');
                        noFriendsItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
                        const noFriendsSpan = document.createElement('span');
                        noFriendsSpan.textContent = currentLanguage === 'en' ? "No friends" : (currentLanguage === 'fr' ? "Pas d'amis" : "No hay amigos");
                        noFriendsItem.appendChild(noFriendsSpan);
                        dropdownMenu.appendChild(noFriendsItem);
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression de l'ami :", error);
                    alert("Erreur lors de la suppression de l'ami");
                }
            });

            // Afficher le profil de l'ami
            buttonDisplayFriend.onclick = () => UserProfileView(nameSpan.textContent);
            buttonDisplayFriend.appendChild(nameSpan);
            listItem.appendChild(circleIsConnect);
            listItem.appendChild(buttonDisplayFriend);
            listItem.appendChild(actionButton);
            dropdownMenu.appendChild(listItem);
        }
    }
}

// Change Username
const popUpUsernameVAR = `<input type="text" id="usernameChange" place-holder="Change Username">`;

// Change Picture
const popUpProfilPictureVAR = 
`<div class="popover">
    <input type="file" id="formFile" hidden>
    <button id="photoSimulateClickInput">Change your profile photo</button>
</div>`;

    
const togglePopover = (event) => 
{
    // Check if popover already exists
    let existingPopover = document.getElementById('dynamicPopover');


    if (existingPopover && event.target !== ELEMENTs.fileButton()) 
        existingPopover.remove();
    else 
    {
        // Create a container div and set its content
        const popoverContainer = document.createElement('div');
        popoverContainer.id = 'dynamicPopover';
        popoverContainer.innerHTML = popUpProfilPictureVAR;
        // Style and position the popover
        const rect = ELEMENTs.changeProfilePhotoButton().getBoundingClientRect();
        popoverContainer.style.top = `${rect.bottom + window.scrollY}px`;
        popoverContainer.style.position = 'absolute';
        popoverContainer.style.left = `45px`;
        popoverContainer.style.zIndex = 1;
        popoverContainer.style.width = '233px';
        
        // Append the popover to the body
        ELEMENTs.changeProfilePhotoButton().appendChild(popoverContainer);
    }
};


///changePicture
document.addEventListener('click', (event) => 
{
    let profilePhoto;

    if (ELEMENTs.changeProfilePhotoButton() === null)
        return ;
    if (ELEMENTs.fileButton() !== null)
        {
            if (event.target === ELEMENTs.fileButton()){
            console.log("event dans ma fonction ta capte: ");
            ELEMENTs.formFile().click();
            ELEMENTs.formFile().addEventListener('change', (event) => {
                profilePhoto = event.target.files[0];
                changePicture(profilePhoto);
                document.getElementById('dynamicPopover')?.remove();
            });
        }
    }
    if (event.target === document.getElementById("profilPhotoInProfilePage"))
        {
            togglePopover({ target: ELEMENTs.changeProfilePhotoButton() });
        }
        if (!ELEMENTs.changeProfilePhotoButton().contains(event.target) && !document.getElementById('dynamicPopover')?.contains(event.target)) {
            document.getElementById('dynamicPopover')?.remove();
        }
    });
    
async function changePicture(picture) {
    const data = new FormData();
    data.append("picture", picture);
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.UPDATEPHOTO , data);
    if (response.status === 'success') {
        alert('Profile photo updated');
        console.log("response.photo: ", response.photo);
        replace_location(PATHs.VIEWS.PROFILE);
    }
    else if (response.status === 'error') 
    {
        if (typeof response.errors === 'object') {
            let errorMessages = '';
            for (let key in response.errors) {
                if (response.errors.hasOwnProperty(key)) {
                    errorMessages += `${key}: ${response.errors[key]}\n`;
                }
            }
            const tmp = errorMessages.substring(0, 7);
            if (strcmp(tmp, "__all__")) {
                errorMessages = errorMessages.substring(9);
            }
            alert(errorMessages);
        } else {
            alert(response.message);
            console.log("Errors:", response.message);
        }
    }
}

// Change Username
document.addEventListener('click', async (event) => 
{
    if (ELEMENTs.changeUsernameButton() !== null)
    {
        if (event.target === ELEMENTs.changeUsernameButton())
        {
            // console.log("reconnu comme cree ELEMENTs.changeUsernamePopOver(): ", ELEMENTs.changeUsernamePopOver());
            if (ELEMENTs.changeUsernamePopOver() === null)
            {
                console.log("create le bail");
                const popoverContainer = document.createElement('div');
                popoverContainer.id = "changeUsernamePopOver";
                popoverContainer.innerHTML = popUpUsernameVAR;
                const rect = ELEMENTs.changeUsernameButton().getBoundingClientRect();
                popoverContainer.style.position = 'absolute';
                popoverContainer.style.top = `${rect.top + window.scrollY}px`;
                popoverContainer.style.left = `${rect.left + window.scrollX + 10}px`;
                popoverContainer.style.zIndex = 1;
                popoverContainer.style.width = '150px';
                popoverContainer.style.height = '20px';
                ELEMENTs.changeUsernameButton().appendChild(popoverContainer);
            }
        }
        else if (document.getElementById('usernameChange') && event.target === usernameChange)
        {
            usernameChange.addEventListener('keypress', async (event) =>
            {
                if (event.key === 'Enter')
                {
                    event.preventDefault();
                    const newUsername = document.getElementById('usernameChange').value;
                    ELEMENTs.changeUsernamePopOver().remove();
                    changeUsername(newUsername);
                }
                if(event.key === 'space')
                {
                    event.preventDefault();   
                }
            });
        }
        else if (ELEMENTs.changeUsernamePopOver())
            ELEMENTs.changeUsernamePopOver().remove();
    }
});

async function changeUsername(newUsername) {
    console.log("newUsername: ", newUsername);
    const data = new FormData();
    data.append("username", newUsername);
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.UPDATEPROFILE , data);
    if (response.status === 'success') {
        alert('Username updated');
        replace_location(PATHs.VIEWS.PROFILE);
    }
    else if (response.status === 'error') 
    {
        if (typeof response.errors === 'object') {
            let errorMessages = '';
            for (let key in response.errors) {
                if (response.errors.hasOwnProperty(key)) {
                    errorMessages += `${key}: ${response.errors[key]}\n`;
                }
            }
            const tmp = errorMessages.substring(0, 7);
            if (strcmp(tmp, "__all__")) {
                errorMessages = errorMessages.substring(9);
            }
            alert(errorMessages);
        } else {
            alert(response.message);
            console.log("Errors:", response.message);
        }
    }
}



ELEMENTs.bookProfile().addEventListener('mouseleave', function() 
{
    console.log("je suis dans le mouseleave");
    if (document.getElementById("dropdownMenu"))
        document.getElementById("dropdownMenu").innerHTML = '';
    if (document.getElementById("waitingFriendDropdownMenu"))
        document.getElementById('waitingFriendDropdownMenu').innerHTML = '';
});