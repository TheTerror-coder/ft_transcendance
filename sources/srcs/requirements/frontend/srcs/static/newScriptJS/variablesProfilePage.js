


const profilePageDisplayVAR = 
`<div class="profilePage">
    <div style="display:flex; flex-direction: column;">
        <div class="bookProfile">
            <div class="sideBar">
            </div>
            <div style="display:flex; flex-direction: column; width:180px;">
                <h1 style="font-size: 30px; align-self: center;">Friends</h1>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        Friends List
                    </button>
                    <ul class="dropdown-menu" id="friendDropdownMenu" aria-labelledby="dropdownMenuButton">
                    </ul>
                </div>
                <h1 style="font-size: 30px; align-self: center;">waitingListFriend</h1>
                <form style="width:170px;">
                    <div class="form-group">
                        <select multiple class="form-control" id="waitingListFriend">
                        <option>Username</option>
                        <option>Username</option>
                        <option>Username</option>
                        <option>Username</option>
                        <option>Username</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="cover">
                <p>SOCIAL</p>
            </div>
        </div>
        
        <div class="wantedFriendHomePageDisplay">
            <div class="wantedProfileInProfilePage">
                <button id="changeProfilePhotoButton" type="button">
                    <img src="/photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture" id="profilPhotoInProfilePage">
                </button>
                <div style="display: flex; flex-direction: column;">
                    <button>
                        <p id="changeUsernameButton">USERNAME</p>
                    </button>
                    <span>10.000</span>
                </div>
            </div>
        </div>
    </div>
</div>`;

{/* <input style="width: 170px; margin-top: 20px;"></input>
<div style="display:flex; justify-content: center; margin-top: 20px;">
    <button class="buttonCreate type="submit"">ADD</button>
</div> */}


{/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-example-modal-sm">Small modal</button> */}

