{/*
*/}



const profilePageDisplayVAR = 
`<div class="profilePage">
    <div style="display:flex; flex-direction: column;">
        <div class="bookProfile">
            <div class="sideBar">
            </div>
            <div class="profileFriendInBook">
                <img src="/static/photos/picturePng/homePage/add_friend_button.png" alt="friendPage" style="width:230px; margin-top: -30px;">
                <div class="dropdown" style="margin-top: -130px;">
                    <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span>FRIEND LIST</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end overflow-auto p-0 dropDownMenuInProfileMenu" style="inset: 0px -20px auto auto" id="friendDropdownMenu">
                    </ul>
                </div>
                <div class="dropdown" style="margin-bottom: -76px;">
                    <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span>WAITING FRIEND LIST</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end overflow-auto p-0 dropDownMenuInProfileMenu" id="waitingFriendDropdownMenu">
                    </ul>
                </div>
            </div>
            <div class="cover">
            </div>
        </div>
        <div class="wantedProfileInProfilePage">
            <button id="changeProfilePhotoButton" type="button">
                <img src="/photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profileProfilePagePicture" id="profilPhotoInProfilePage">
            </button>
            <button>
                <p id="changeUsernameButton">USERNAME</p>
            </button>
            <span>10.000</span>
        </div>
    </div>
    <div style="width: -webkit-fill-available;justify-content: end;display:flex;">
        <button style="align-self:baseline;"><img src="/static/photos/picturePng/cross.png" id="cross"></button>
    </div>
</div>`;

{/* <div style="display: flex; flex-direction: column;">
</div> */}


{/* <input style="width: 170px; margin-top: 20px;"></input>
<div style="display:flex; justify-content: center; margin-top: 20px;">
    <button class="buttonCreate type="submit"">ADD</button>
</div> */}


{/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-example-modal-sm">Small modal</button> */}

