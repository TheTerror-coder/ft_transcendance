


const profilePageDisplayVAR = 
`<div class="profilePage" id="profilePage">
    <div style="display: block; flex-direction: column;">
        <div class="friendDisplay" id="friendDisplay">
            <p>SOCIAL</p>
            <img src="../static/photos/picturePng/homePage/add_friend_button.png" alt="one piece crew !">
            <h1>Friends</h1>
            <div id="listFriend"></div>
        
            <h1>Pending Friend Requests</h1>
            <div id="pendingRequests"></div>
            <form method="post" id="removeFriendForm">
                <div class="form-group">
                    <label for="friendUsernameREMOVE">REMOVE FRIEND</label>
                    <input type="text" class="form-control" placeholder="Enter Username" id="usernameRemoveFriend" name="username" required>
                </div>
                <button type="submit" class="btn btn-danger" id="submitRemoveFriendButton">Remove</button>
            </form>
        </div>
        <button class="wantedProfile" id="wantedInProfilePage">
                <img src="../static/photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
            <p>USERNAME</p>
            <span>10.0</span>
        </button>

        <form id="updateProfileForm">
            <input type="text" class="form-control" placeholder="Enter new Username" id="newUsername" name="newUsername" required>
            <button type="submit" class="btn btn-danger" id="buttonChangeUsername">Submit username</button>
        </form>

        <form>
            <input id="newPicture" type="file" id="updatedPhoto" required>
            <button id="buttonChangePicture" type="submit" class="btn btn-danger">Submit picture</button>
        </form>
    </div>
</div>`;