// ici je recupere les elements de fin de match de chaqu'un des deux joueurs
// je fetch les elements de fin de match de chaqu'un des deux joueurs
// j'applique les modif de stat pour chaqu'un des deux joueurs
// je fetch les elements de chaque joueur


//const response_game = await makeRequest('GET', URLs.USERMANAGEMENT.LOBBY);

//const player = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, player);
//const opponent = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, opponent);

//const bool player_win = (player === win) == TRUE

// const player_score, opponent_score = calculateScore(player.game_played, player.victories, opponent.game_played, opponent.victories, player_win);
// player.prime += player_score;
// opponent.prime += opponent_score;

// const data_player = {"username": player.username, "victorie": player.victorie, "game played": player.gamePlayed, "prime": player.prime};
// const data_opponent = {"username": opponent.username, "victorie": opponent.victorie, "game played": opponent.gamePlayed, "prime": opponent.prime};

// const resp_player = await makeRequest('GET', URLs.USERMANAGEMENT.SETINFOGAME, data_player);
// const resp_opponent = await makeRequest('GET', URLs.USERMANAGEMENT.SETINFOGAME, data_opponent);

async function updateLobby(data)
{

    if (nbPerTeam === 1 && data[2].length === 1) // marche bien !
    {
        await updateLobbyOneVsOne(data);
        // TODO regarder si le lobby est plein
        console.log("avant on click de start game lobby");
        ELEMENTs.PlayButtonInLobby().onclick = () => startGameLobby();

    }
    else if (nbPerTeam === 2)
    {
        console.log("2 joueurs par equipe");
        await updateLobbyTwoVsTwo(data);
        ELEMENTs.PlayButtonInLobby().onclick = () => startGameLobby();
    }
}
 
async function updateLobbyOneVsOne(data)
{
    const user1 = {"username": data[1][0].name};
    const responseCreator = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user1);
    if (data[2].length === 1)
    {
        const user2 = {"username": data[2][0].name};
        console.log("data[2][0].name", data[2][0].name);
        if (ELEMENTs.lobbyDisplayRapidPlayPlayerTwo() !== null)
        {

            ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo; // TO DO: check if the guy is on the good page
            if (data[2].length === 1)
            {
                const imgElement2 = document.getElementById("pictureOfWanted2");
                const response = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user2);
                // setTimeout(() =>{
                const photoUrl2 = response.user_info.photo;
                imgElement2.src = photoUrl2;
                document.getElementById("usernameOfWanted2").innerHTML = data[2][0].name;
                let primeAmount2 = response.user_info.prime;
                if (response.user_info.prime === null)
                    primeAmount2 = 0;
                document.getElementById("primeAmount2").innerHTML = primeAmount2;
                // }, 30);
            }
            const photoUrl1 = responseCreator.user_info.photo;
            const imgElement1 = document.getElementById("pictureOfWanted");
            imgElement1.src = photoUrl1;
            document.getElementById("usernameOfWanted").innerHTML = data[1][0].name;
            document.getElementById("primeAmount").innerHTML = responseCreator.user_info.prime;
            if (responseCreator.user_info.prime === null) // TODO: should be in the back
                document.getElementById("primeAmount").innerHTML = 0;
        }
    }
}

async function setwantedProfileInLobby(user, position)
{
    const imgElement = document.getElementById(`pictureOfWanted${position}`);
    const userResponse = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user);

    // setTimeout(() =>{
        const photoUrl = userResponse.user_info.photo;
        imgElement.src = photoUrl;
        document.getElementById(`usernameOfWanted${position}`).innerHTML = user.username;
        let primeAmount = userResponse.user_info.prime;
        if (userResponse.user_info.prime === null)
            primeAmount = 0;
        document.getElementById(`primeAmount${position}`).innerHTML = primeAmount;
    // }, 30);
}

async function updateLobbyTwoVsTwo(data)
{
    if (data[1] && data[1][0] && data[1][0].name !== undefined)
    {
        console.log("position 1: ", data[1][0].name);
        console.log("ROLE: ", data[1][0].role);
        const user = {"username": data[1][0].name};
        const pos = data[1][0].role === "captain" ? 1 : 2;
        console.log("pos: ", pos);
        pos === 1 ? ELEMENTs.lobbyDisplayRapidPlayPlayerOne().innerHTML = wantedPlayerOne : ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;
        await setwantedProfileInLobby(user, pos);
    }
    if (data[1] && data[1][1] && data[1][1].name !== undefined)
    {
        console.log("position 2: ", data[1][1].name);
        const user = {"username": data[1][1].name};
        ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;

        const pos = data[1][1].role === "captain" ? 1 : 2;
        pos === 1 ? ELEMENTs.lobbyDisplayRapidPlayPlayerOne().innerHTML = wantedPlayerOne : ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;

        console.log("pos: ", pos);
        await setwantedProfileInLobby(user, pos);
    }
    if (data[2] && data[2][0] && data[2][0].name !== undefined)
    {
        console.log("position 3: ", data[2][0].name);
        const user = {"username": data[2][0].name};
        const pos = data[2][0].role === "captain" ? 3 : 4;
        pos === 3 ? ELEMENTs.lobbyDisplayRapidPlayPlayerThree().innerHTML = wantedPlayerThree : ELEMENTs.lobbyDisplayRapidPlayPlayerFour().innerHTML = wantedPlayerFour;
        console.log("pos: ", pos);
        await setwantedProfileInLobby(user, pos);
    }
    if (data[2] && data[2][1] && data[2][1].name !== undefined)
    {
        console.log("position 4: ", data[2][1].name);
        const user = {"username": data[2][1].name};
        const pos = data[2][1].role === "captain" ? 3 : 4;
        console.log("pos: ", pos);
        pos === 3 ? ELEMENTs.lobbyDisplayRapidPlayPlayerThree().innerHTML = wantedPlayerThree : ELEMENTs.lobbyDisplayRapidPlayPlayerFour().innerHTML = wantedPlayerFour;
        await setwantedProfileInLobby(user, pos);
    }
}

function startGameLobby ()
{
    console.log("juste avant le changement");
    ELEMENTs.background().style.backgroundImage = "url('/static/photos/picturePng/lobbyPage/luffyBoat.png')";
    console.log("savedGameCode: ", savedGameCode);
    globalSocket.emit('launchGame', savedGameCode);
}