
async function displayWaitingListFriend(friends) {

    // Reference the dropdown menu
    const dropdownMenu = document.getElementById('waitingFriendDropdownMenu');
    console.log("friends: ", friends);
    if (friends.length === 0)
    {
        const listItem = document.createElement('li');
        listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = "No friends invite";
        listItem.appendChild(nameSpan);
        dropdownMenu.appendChild(listItem);
    }
    else
    {
        for(let i = 0; i < friends.length; i++)
        {
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
            imgButtonAdd.src =  "/static/photos/picturePng/profilePage/approvebutton.png";
            imgButtonAdd.alt = "Add Friend";

            const imgButtonRemove = document.createElement("img");
            imgButtonRemove.src =  "/static/photos/picturePng/profilePage/crossButtonFriend.png";
            imgButtonRemove.alt = "Remove Friend";


            actionAddButton.appendChild(imgButtonAdd);
            actionRemoveButton.appendChild(imgButtonRemove);
            divForButton.appendChild(actionAddButton);
            divForButton.appendChild(actionRemoveButton);

// si j'actualise, la websocket ne fonctionne plus donc socket.send ne fonctionne plus
            actionAddButton.addEventListener('click', () => {
                alert(`add ${friends[i].from_user}`);
                console.log("data.friend_request_id: ", friends[i].friend_request_id);
                socket.send(JSON.stringify({
                    type: 'response.invitation',
                    response: 'accept',
                    friend_request_id: friends[i].friend_request_id
                }));
            });

            actionRemoveButton.addEventListener('click', () => {
                alert(`remove ${friends[i].from_user}`);
                console.log("data.friend_request_id: ", friends[i].friend_request_id);
                socket.send(JSON.stringify({
                    type: 'response.invitation',
                    response: 'reject',
                    friend_request_id: friends[i].friend_request_id
                }));
            });

            listItem.appendChild(nameSpan);
            listItem.appendChild(divForButton);

            dropdownMenu.appendChild(listItem);
        }
    }
}






async function displayFriend(friends)
{
// Example list of friends (can be fetched from an API)

    // Reference the dropdown menu
    const dropdownMenu = document.getElementById('friendDropdownMenu');
    if (friends.length === 0)
    {
        const listItem = document.createElement('li');
        listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = "No friends";
        listItem.appendChild(nameSpan);
        dropdownMenu.appendChild(listItem);
    }
    else {
        for (let i = 0; i < friends.length; i++)
        {
            console.log("alors peut etre que ca va marcher: ", friends[i].username);
            const listItem = document.createElement('li');
            listItem.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = friends[i].username;

            const actionButton = document.createElement('button');
            const imgButton = document.createElement("img");
            imgButton.src =  "/static/photos/picturePng/profilePage/crossButtonFriend.png";
            imgButton.alt = "removeFriend";
            imgButton.style.display = "flex";
            imgButton.style.flexDirection = "flex-end";
            actionButton.appendChild(imgButton);
            actionButton.addEventListener('click', () => {
                alert(`Interacting with ${friends[i].username}`);
                const response = makeRequest('POST', URLs.USERMANAGEMENT.REMOVEFRIEND, {username: friends[i].username});
                console.log("response-couille: ", response);
                alert(response.message);
            });

            listItem.appendChild(nameSpan);
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
    {
        existingPopover.remove(); // Remove it if it exists
    } 
    else 
    {
        // Create a container div and set its content
        const popoverContainer = document.createElement('div');
        popoverContainer.id = 'dynamicPopover';
        popoverContainer.innerHTML = popUpProfilPictureVAR;
        // Style and position the popover
        const rect = ELEMENTs.changeProfilePhotoButton().getBoundingClientRect();
        popoverContainer.style.position = 'absolute';
        popoverContainer.style.top = `${rect.bottom + window.scrollY}px`;
        popoverContainer.style.left = `${rect.left + window.scrollX + 10}px`;
        popoverContainer.style.zIndex = 1;
        popoverContainer.style.width = '233px';
        
        // Append the popover to the body
        ELEMENTs.changeProfilePhotoButton().appendChild(popoverContainer);
    }
};


//changePicture
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
            console.log("reconnu comme cree ELEMENTs.changeUsernamePopOver(): ", ELEMENTs.changeUsernamePopOver());
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
                popoverContainer.style.width = '233px';
                popoverContainer.style.height = '30px';
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