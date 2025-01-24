



const usersProfilePage = 
`<div class="profilePage" id="profilePage">
    <div style="display:flex; justify-content: center; align-items: center;">
        <div class="wantedProfileInProfilePage">
            <button id="pictureUser" type="button">
                <img src="" alt="profile picture" class="profileProfilePagePicture" id="profilPhotoInProfilePage">
            </button>
            <button>
                <p id="nameUser"></p>
            </button>
            <span id="prime"></span>
        </div>
    </div>
    <div style="display:flex; flex-direction: column; width: -webkit-fill-available;">
        <div id="statistique" style="height: 350px;">
            <p style="display:flex; justify-content: center;" class="statHistoTitle" data-translate="Stat"></p>
            <div style="display:flex; justify-content: space-between; margin-left: 360px; margin-right: 360px;">
                <div style="display:flex; flex-direction: column;">
                    <p style="align-self: center; font-size: 40px; margin-bottom: 0; letter-spacing: 2px;" data-translate="WinRate"></p>
                    <div class="progress-container">
                        <div class="circular-progress">
                            <span class="progress-value"></span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="first-content">
                        <span data-translate="GamePlayed"></span>
                        <span id="numberOfGamePlayedProfileDisplay"></span>
                    </div>
                    <div class="second-content">
                        <span data-translate="GameWin"></span>
                        <span id="numberOfGameWinProfileDisplay"></span>
                        <span style="margin-top: 10px;" data-translate="GameLose"></span>
                        <span id="numberOfGameLosesProfileDisplay"></span>
                    </div>
                </div>
            </div>
        </div>
        <div style="display: flex; width: -webkit-fill-available; justify-content: center;">
            <div class="historicBanner">
                <p data-translate="Historic" class="statHistoTitle"></p>
                <div id="historicMatch" class="historicMatch"></div>
            </div>
        </div>
    </div>
    <div class="bottomProfilePage"></div>
</div>`;




const profilePageDisplayVAR = 
`<div class="profilePage" id="profilePage">
    <div style="display:flex; flex-direction: column; justify-content: space-between; margin-top: 10px; margin-bottom: 10px;">
        <div class="bookProfile" id="bookProfile">
            <div class="sideBar">
            </div>
            <div class="profileFriendInBook">
                <img src="/static/photos/picturePng/homePage/add_friend_button.png" alt="friendPage" style="width:230px; align-self: center;">
                <div class="dropdown" style="align-self: end; margin-bottom: 130px;">
                    <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span data-translate="FriendList">FRIEND LIST</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end overflow-auto p-0 dropDownMenuInProfileMenu" style="inset: 0px -20px auto auto" id="friendDropdownMenu">
                    </ul>
                </div>
                <div class="dropdown" style="align-self: end;">
                    <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span data-translate="waitingFriendlist">WAITING FRIEND LIST</span>
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
                <img src="/frontpong/media/photos/default.png" alt="profile picture" class="profileProfilePagePicture" id="profilPhotoInProfilePage">
            </button>
            <button>
                <p id="changeUsernameButton">USERNAME</p>
            </button>
            <span id="primeAmount"></span>
        </div>
    </div>
    <div style="display:flex; flex-direction: column; width: -webkit-fill-available;">
        <div id="statistique" style="height: 350px; ">
            <p data-translate="Stat" style="display:flex; justify-content: center;" class="statHistoTitle">Statistic</p>
            <div style="display:flex; justify-content: space-between; margin-left: 360px; margin-right: 360px;">
                <div style="display:flex; flex-direction: column;">
                    <p data-translate="WinRate" style="align-self: center; font-size: 40px; margin-bottom: 0; letter-spacing: 2px;">Win rate</p>
                    <div class="progress-container">
                        <div class="circular-progress">
                            <span class="progress-value"></span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="first-content">
                        <span data-translate="GamePlayed">Games Played:</span>
                        <span id="numberOfGamePlayedProfileDisplay"></span>
                    </div>
                    <div class="second-content">
                        <span data-translate="GameWin">Games win:</span>
                        <span id="numberOfGameWinProfileDisplay"></span>
                        <span data-translate="GameLose" style="margin-top: 10px;">Games lose:</span>
                        <span id="numberOfGameLosesProfileDisplay"></span>
                    </div>
                </div>
            </div>
        </div>
        <div style="display: flex; width: -webkit-fill-available; justify-content: center;">
            <div class="historicBanner">
                <p data-translate="Historic" class="statHistoTitle">HISTORIC</p>
                <div id="historicMatch" class="historicMatch"></div>
            </div>
        </div>
    </div>
    <div class="bottomProfilePage"></div>
</div>`;