
async function displayFriend()
{
// Example list of friends (can be fetched from an API)
const friends = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

// Reference the dropdown menu
const dropdownMenu = document.getElementById('friendDropdownMenu');

// Populate the dropdown with list items
friends.forEach(friend => {
  // Create a dropdown item (li)
  console.log("in each of this things brroo, friend: ", friend);
  const listItem = document.createElement('li');
  listItem.className = 'dropdown-item d-flex justify-content-between align-items-center';

  // Add friend's name
  const nameSpan = document.createElement('span');
  nameSpan.textContent = friend;

  // Add button
  const actionButton = document.createElement('button');
  actionButton.className = 'btn btn-primary btn-sm';
  actionButton.textContent = 'Interact';
  console.log("le button");
  actionButton.addEventListener('click', () => {
    alert(`Interacting with ${friend}`);
  });

  // Append name and button to the list item
  console.log("listItem BEFORE: ", listItem);
  listItem.appendChild(nameSpan);
  console.log("nameSpan", nameSpan);
  listItem.appendChild(actionButton);
    console.log("actionButton", actionButton);
  console.log("listItem AFTER: ", listItem);

  // Add the list item to the dropdown menu
  dropdownMenu.appendChild(listItem);
  console.log("dropdownMenu: ", dropdownMenu);
});
}

const popUpFriendVAR = 
`<div class="popover">
    <input type="file" id="formFile" hidden>
    <button id="photoSimulateClickInput">Change your profile photo</button>
</div>`;

    
const togglePopover = (event) => 
{
    // Check if popover already exists
    let existingPopover = document.getElementById('dynamicPopover');

    if (ELEMENTs.formFile() && event.target === ELEMENTs.fileButton())
    {
        console.log("ELEMENTs.formFile().value");
    }
    else if (existingPopover) {
        existingPopover.remove(); // Remove it if it exists
    } 
    else 
    {
        // Create a container div and set its content
        const popoverContainer = document.createElement('div');
        popoverContainer.id = 'dynamicPopover';
        popoverContainer.innerHTML = popUpFriendVAR;
        
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
    
async function changePicture(params) {
    const data = new FormData();
    data.append("picture", params);
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