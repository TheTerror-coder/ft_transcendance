

const profilePageDisplayVAR = 
`<div class="profilePage">
    <div style="display:flex; flex-direction: column; justify-content: space-between;">
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
        <div class="form-check form-switch" style="display: flex; justify-content: center;">
            <input class="form-check-input" type="checkbox" role="switch" id="switch2FA">
            <label class="form-check-label" for="switch2FA" style="font-size: 15px;"> disable/enable 2FA</label>
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
    <div style="display:flex; flex-direction: column; width: -webkit-fill-available;">
        <div id="statistique" style="height: 350px; ">
            <p style="display:flex; justify-content: center;" class="statHistoTitle">Statistic</p>
            <div style="display:flex; justify-content: space-between; margin-left: 360px; margin-right: 360px;">
                <div style="display:flex; flex-direction: column;">
                    <p style="align-self: center; font-size: 40px; margin-bottom: 0; letter-spacing: 2px;">Win rate</p>
                    <div class="progress-container">
                        <div class="circular-progress">
                            <span class="progress-value">75%</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="first-content">
                        <span>Games Played:</span>
                        <span id="numberOfGamePlayedProfileDisplay">0</span>
                    </div>
                    <div class="second-content">
                        <span>Games win:</span>
                        <span id="numberOfGameWinProfileDisplay">0</span>
                        <span style="margin-top: 10px;">Games lose:</span>
                        <span id="numberOfGameLosesProfileDisplay">0</span>
                    </div>
                </div>
            </div>
        </div>
        <div style="display: flex; width: -webkit-fill-available; justify-content: center;">
            <div class="historicBanner">
                <p class="statHistoTitle">HISTORIC</p>
                <div id="historicMatch" class="historicMatch"></div>
            </div>
        </div>
    </div>
    <div style="justify-content: end; display: flex;">
        <button style="align-self:baseline;"><img src="/static/photos/picturePng/cross.png" id="cross"></button>
    </div>
    <div class="bottomProfilePage"></div>
</div>`;