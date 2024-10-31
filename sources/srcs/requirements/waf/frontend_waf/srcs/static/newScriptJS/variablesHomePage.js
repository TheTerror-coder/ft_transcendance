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


const homePageDisplayVAR = `<div class="homePage" id="homePage">
    <div class="rebecca" id="rebecca">
        <img src="../static/photos/picturePng/homePage/rebecca_newspapers.png" alt="Rebecca" style="margin-top: -10px;" class="rebeccaImg" id="rebeccaImg">
    </div>
    <div class="centerHomepage" id="centerHomepage">
        <div class="playButton" id="playButton">
            <button class="playImg" id="playButtonImg">PLAY</button>
        </div>
        <div class="addFriend" id="addFriend">
            <p>SOCIAL</p>
            <img src="../static/photos/picturePng/homePage/add_friend_button.png" alt="one piece crew !">
            <p>Friend</p>
            <form method="post">
                {% csrf_token %}
                <div class="form-group">
                    <label for="friendUsernameADD">ADD FRIEND</label>
                    <input type="text" class="form-control" placeholder="Enter Username" id="usernameAddFriend" name="username" required>
                </div>
                <button type="submit" class="btn btn-primary" id="submitFriendButton">Submit</button>
            </form>
        </div>
        <div class="playDisplay" id="playDisplay">
            <button class="rapidPlay" id="rapidPlayButton">RAPID PLAY</button>
            <button id="tournamentButton">TOURNAMENT</button>
            <!-- rapidPlayButton -->
            <button class="joinLobbyButton" id="joinLobbyButton">JOIN LOBBY</button>
            <button class="createLobbyButton" id="createLobbyButton">CREATE LOBBY</button>
            <button class="onePlayerButton" id="onePlayerButton">ONE PLAYER</button>
            <button class="twoPlayerButton" id="twoPlayerButton">TWO PLAYER</button>
            <button class="captainButton" id="captainButton">CAPTAIN</button>
            <button class="gunnerButton" id="gunnerButton">GUNNER</button>

            <!-- TournamentButton -->
            <button class="createTournamentButton" id="createTournamentButton">CREATE TOURNAMENT</button>
            <button class="joinTournamentButton" id="joinTournamentButton">JOIN TOURNAMENT</button>
        </div>
        <div class="wantedFriendHomePageDisplay" id="wantedFriendHomePageDisplay">
            <button class="wantedProfile" id="wantedProfile">
                <img src="../static/photos/picturePng/homePage/luffy_avatar.png" alt="profile picture" class="profilePicture">
                <h1 id="usernameDisplay"></h1>
                <span>10.000</span>
            </button>
            <div class="friendButton" id="friendButton">
                <button id="buttonFriend"><img src="../static/photos/picturePng/homePage/add_friend_button.png" alt="add friend"></button>
            </div>
        </div>
    </div>
</div>`;

