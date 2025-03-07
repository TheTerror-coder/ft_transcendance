
async function statsInProfilePage(game_played, victories, lose)
{
    let percentage = 0;
    if (victories === undefined)
        victories = 0;
    if (lose === undefined)
        lose = 0;
    if (game_played === undefined)
        game_played = 0;
    if (game_played > 0) {
        percentage = (victories / game_played) * 100;
    }

    percentage = Math.min(Math.max(percentage, 0), 100);
    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');

    percentage = Math.round(percentage);

    circularProgress.style.background = `conic-gradient(
        #4caf50 0% ${percentage}%, 
        #e0e0e0 ${percentage}% 100%
    )`;

    progressValue.textContent = `${percentage}%`;

    document.getElementById('numberOfGamePlayedProfileDisplay').textContent = game_played;
    document.getElementById('numberOfGameWinProfileDisplay').textContent = victories;
    document.getElementById('numberOfGameLosesProfileDisplay').textContent = lose;
}

async function getHistoric(game, user)
{
    if (game.length === 0)
    {
        const match = document.createElement('div');
        match.className = 'matchDisplayHistoric';
		match.style.height = "120px"; 
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
    }
    else
    {
        for (let i = 0; i < game.length; i++)
        {
            const match = document.createElement('div');
            match.className = 'matchDisplayHistoric';
            const username = document.createElement('span');
            const advUsername = document.createElement('span');
            const resultUser = document.createElement('span');
            const resultAdvUser = document.createElement('span');
            const winOrLoseDiv = document.createElement('div');
            const vsImg = document.createElement('img');
            vsImg.src = "/static/photos/picturePng/profilePage/versusLogoStat.png";
            vsImg.alt = "vs";

			advUsername.style.width = "105px";
			username.style.width = "105px";

            resultUser.className = 'resultDisplayHistoric';
            resultAdvUser.className = 'resultDisplayHistoric';
            if (user === game[i].player)
            {
                username.textContent = game[i].player;
                resultUser.textContent = game[i].player_score;
                resultAdvUser.textContent = game[i].opponent_score;
                advUsername.textContent = game[i].opponent;
                statDisplayWinOrLose(winOrLoseDiv, game[i].player_score, game[i].opponent_score, match);
            }
            else
            {
                username.textContent = game[i].opponent;
                resultUser.textContent = game[i].opponent_score;
                resultAdvUser.textContent = game[i].player_score;
                advUsername.textContent = game[i].player;
                statDisplayWinOrLose(winOrLoseDiv, game[i].opponent_score, game[i].player_score, match);
            }
            winOrLoseDiv.style.backgroundSize = "cover";
            winOrLoseDiv.style.backgroundRepeat = "no-repeat";
            winOrLoseDiv.style.backgroundPosition = "center";

            winOrLoseDiv.className = 'winOrLoseDiv';

            match.appendChild(winOrLoseDiv);
            match.appendChild(username);
            match.appendChild(resultUser);
            match.appendChild(vsImg);
            match.appendChild(resultAdvUser);
            match.appendChild(advUsername);
            ELEMENTs.historicMatch().appendChild(match);
        }
    }
}

function statDisplayWinOrLose(winOrLoseDiv, player, opponent, match)
{
    if (player > opponent)
    {
        match.style.backgroundColor = "rgba(0, 228, 0, 0.3)";
        winOrLoseDiv.style.backgroundImage = "url('/static/photos/picturePng/profilePage/luffyWin.png')";
    }
    else
    {
        match.style.backgroundColor = "rgba(228, 0, 0, 0.3)";
        winOrLoseDiv.style.backgroundImage = "url('/static/photos/picturePng/profilePage/usoppLose.png')";
    }
}

async function displayWaitingListFriend(friends) {
    const dropdownMenu = document.getElementById('waitingFriendDropdownMenu');

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

            actionAddButton.addEventListener('click', async () => {
                alert(`add ${friends[i].from_user}`);

                ONE_SOCKET.send(JSON.stringify({
                    type: 'response.invitation',
                    to_user: friends[i].from_user,
                    response: 'accept',
                    friend_request_id: friends[i].friend_request_id
                }));

                dropdownMenu.removeChild(listItem);

                await addFriendToFriendList(friends[i]);

                if (dropdownMenu.children.length === 0) {
                    const noInvitationsItem = document.createElement('li');
                    noInvitationsItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
                    const noInvitationsSpan = document.createElement('span');
                    noInvitationsSpan.textContent = currentLanguage === 'en' ? "No Invitations Waiting" : (currentLanguage === 'fr' ? "Aucune Invitations en Attente" : "No hay invitaciones en espera");
                    noInvitationsItem.appendChild(noInvitationsSpan);
                    dropdownMenu.appendChild(noInvitationsItem);
                }
            });

            actionRemoveButton.addEventListener('click', () => {
                alert(`remove ${friends[i].from_user}`);
                ONE_SOCKET.send(JSON.stringify({
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
        document.getElementById("noFriends").remove();
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
	circleIsConnect.id = 'circle-is-connect';
    circleIsConnect.style.backgroundColor = 'green';
    circleIsConnect.style.border = '1px solid white';

    actionButton.appendChild(imgButton);

    buttonDisplayFriend.onclick = () => UserProfileView(nameSpan.textContent);
    buttonDisplayFriend.appendChild(nameSpan);
    listItem.appendChild(circleIsConnect);
    listItem.appendChild(buttonDisplayFriend);
    listItem.appendChild(actionButton);

    friendListMenu.appendChild(listItem);
}

async function displayFriend(friends, user_socket) {
    const dropdownMenu = document.getElementById('friendDropdownMenu');
    
    dropdownMenu.innerHTML = '';

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
            const circleIsConnect = document.createElement('div');
            circleIsConnect.className = 'circleIsConnect';
            if (friends[i].username in user_socket) {
                circleIsConnect.style.backgroundColor = 'green';
                circleIsConnect.style.border = '1px solid white';
            } else {
                circleIsConnect.style.backgroundColor = 'red';
                circleIsConnect.style.border = '1px solid white';
            }

            actionButton.appendChild(imgButton);
            actionButton.addEventListener('click', async () => {
                try {
                    const response = await makeRequest('POST', URLs.USERMANAGEMENT.REMOVEFRIEND, { username: friends[i].username });
                    alert(`${friends[i].username} ne fait plus partie de vos amis`);

                    dropdownMenu.removeChild(listItem);

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

            buttonDisplayFriend.onclick = () => UserProfileView(nameSpan.textContent);
            buttonDisplayFriend.appendChild(nameSpan);
            listItem.appendChild(circleIsConnect);
            listItem.appendChild(buttonDisplayFriend);
            listItem.appendChild(actionButton);
            dropdownMenu.appendChild(listItem);
        }
    }
}

const popUpUsernameVAR = `<input type="text" id="usernameChange" place-holder="Change Username">`;

const popUpProfilPictureVAR = 
`<div class="popover">
    <input type="file" id="formFile" hidden>
    <button id="photoSimulateClickInput">Change your profile photo</button>
</div>`;

    
const togglePopover = (event) => 
{
    let existingPopover = document.getElementById('dynamicPopover');


    if (existingPopover && event.target !== ELEMENTs.fileButton()) 
        existingPopover.remove();
    else 
    {
        const popoverContainer = document.createElement('div');
        popoverContainer.id = 'dynamicPopover';
        popoverContainer.innerHTML = popUpProfilPictureVAR;
        const rect = ELEMENTs.changeProfilePhotoButton().getBoundingClientRect();
        popoverContainer.style.top = `${rect.bottom + window.scrollY}px`;
        popoverContainer.style.position = 'absolute';
        popoverContainer.style.left = `45px`;
        popoverContainer.style.zIndex = 1;
        popoverContainer.style.width = '233px';
        
        ELEMENTs.changeProfilePhotoButton().appendChild(popoverContainer);
    }
};


document.addEventListener('click', (event) => 
{
    let profilePhoto;

    if (ELEMENTs.changeProfilePhotoButton() === null)
        return ;
    if (ELEMENTs.fileButton() !== null)
        {
            if (event.target === ELEMENTs.fileButton())
            {
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
    if (response.status === 'success') 
        await replace_location(PATHs.VIEWS.PROFILE);
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
        } else
            alert(response.message);
    }
}

document.addEventListener('click', async (event) => 
{
    if (ELEMENTs.changeUsernameButton() !== null)
    {
        if (event.target === ELEMENTs.changeUsernameButton())
        {
            if (ELEMENTs.changeUsernamePopOver() === null)
            {
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
                if (event.key === 'space')
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
	if (!isAlphanumeric(newUsername))
	{
		alert("Invalid input.");
		return ;
	}
    const data = new FormData();
    data.append("username", newUsername);
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.UPDATEPROFILE , data);
    if (response.status === 'success')
        await replace_location(PATHs.VIEWS.PROFILE);
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
        } else
            alert(response.message);
    }
}
