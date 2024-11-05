//HOME PAGE INFORMATION

const centerHomepage = document.querySelector("#centerHomepage");
const homePage = document.querySelector("#homePage");

const buttonFriend = document.querySelector("#buttonFriend");
const friendDisplay = document.querySelector("#friendDisplay");

const submitFriendButton = document.querySelector("#submitFriendButton");
const usernameAddFriend = document.querySelector("#usernameAddFriend");


const rebecca = document.querySelector("#rebecca");
const rebeccaImg = document.querySelector("#rebeccaImg");

const friendButton = document.querySelector("#friendButton");


const wantedProfile = document.querySelector("#wantedProfile");
const profilePage = document.querySelector("#profilePage");

const wantedInProfilePage = document.querySelector("#wantedInProfilePage");


const homePageDisplayVAR = 
`<div class="homePage" id="homePage">
            <div class="rebecca" id="rebecca">
                <img src="../static/photos/picturePng/homePage/rebecca_newspapers.png" alt="Rebecca" style="margin-top: -10px;" class="rebeccaImg" id="rebeccaImg">
            </div>
            <div class="centerHomepage" id="centerHomepage">
                <div class="playButton" id="playButton">
                    <button class="playImg fontTextPlay" id="playButtonImg">PLAY</button>
                </div>

                <div class="addFriend" id="addFriend">
                    <p>SOCIAL</p>
                    <img src="../static/photos/picturePng/homePage/add_friend_button.png" alt="one piece crew !">
                    <p>Friend</p>
                    <form method="post">
                        <div class="form-group">
                            <label for="friendUsernameADD">ADD FRIEND</label>
                            <input type="text" class="form-control" placeholder="Enter Username" id="usernameAddFriend" name="username" required>
                        </div>
                        <button type="submit" class="btn btn-primary" id="submitFriendButton">Submit</button>
                    </form>
                </div>
                <div class="centerPlayDisplay" id="centerPlayDisplay">
                    <div class="playDisplay" id="playDisplay">
                        <!-- rapidPlayButton -->
                         <div class="imgPlayMenu" id="firstElement">
                         </div>
                         <div class="imgPlayMenu" id="secondElement">
                        </div>
                         <div class="imgPlayMenu">
                            <button class="joinLobbyButton fontTextPlay" id="joinLobbyButton">JOIN LOBBY</button>
                         </div>
                         <div class="imgPlayMenu">
                            <button class="createLobbyButton fontTextPlay" id="createLobbyButton">CREATE LOBBY</button>
                         </div>

                        <!-- TournamentButton -->
                        <button class="createTournamentButton fontTextPlay" id="createTournamentButton">CREATE TOURNAMENT</button>
                        <button class="joinTournamentButton fontTextPlay" id="joinTournamentButton">JOIN TOURNAMENT</button>
                    </div>
                </div>
                <button class="wantedProfile" id="wantedProfile">
                    <span>10.000</span>
                </button>
            </div>
            <div class="friendButton" id="friendButton">
                <button id="buttonFriend"><img src="../static/photos/picturePng/homePage/add_friend_button.png" alt="add friend"></button>
            </div>
        </div>`;



        // <button class="onePlayerButton fontTextPlay" id="onePlayerButton">ONE PLAYER</button>
        // <button class="twoPlayerButton fontTextPlay" id="twoPlayerButton">TWO PLAYER</button>
        // <button class="captainButton fontTextPlay" id="captainButton">CAPTAIN</button>
        // <button class="gunnerButton fontTextPlay" id="gunnerButton">GUNNER</button>