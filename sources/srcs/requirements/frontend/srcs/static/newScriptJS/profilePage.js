
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
    <button id="photoSimulateClickInput">Change your profile photo</button>
    <input type="file" id="formFile" hidden>
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
    console.log("event dans ma fonction ta capte: ", event.target);
    if (ELEMENTs.fileButton() !== null)
    {
        if (event.target === ELEMENTs.fileButton())
        {
                ELEMENTs.formFile().click();
                ELEMENTs.formFile().addEventListener('change', (event) => {
                    profilePhoto = event.target.files[0];
                    
                    if (profilePhoto) 
                    {
                        console.log("profilePhoto: ", profilePhoto);
                        document.getElementById('dynamicPopover')?.remove();
                    } else 
                    {
                        console.error('No file selected');
                        document.getElementById('dynamicPopover')?.remove();
                    }
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