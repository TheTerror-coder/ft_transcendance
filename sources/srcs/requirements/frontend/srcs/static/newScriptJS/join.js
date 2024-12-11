async function joinLobbyOnevsOne(gameCode)
{
    console.log("globalSocket in join lobby OnevsOne", globalSocket);
    console.log("lobby one vs one");

    ELEMENTs.mainPage().innerHTML = lobbyPageDisplayVAR;

    const response = await makeRequest('GET', URLs.USERMANAGEMENT.PROFILE);
    setTimeout(() => {
        ELEMENTs.usernameOfWanted().innerHTML = response.username;
        const photoUrl = response.photo;
        const imgElement = ELEMENTs.pictureOfWanted();
        imgElement.src = photoUrl;
        ELEMENTs.primeAmount().innerHTML = response.prime;
        globalSocket.emit('confirmChoices', { teamID: 2, role: "captain", userName: response.username });
        document.getElementById("lobbyCode").innerHTML = gameCode;
        globalSocket.emit('updatePlayerLists', { dataDav });
        setTimeout(() => 
        {
            console.log("data:    ", dataDav);
            console.log("gang:    ", dataDav[1][0].name);
        }, 400);
    }, 400);

    // si pas possible, chopper le display du lobby 1vs1 et mettre le second joueur a droite
}

function joinLobbyTwovsTwo()
{
    console.log("lobby two vs two");

    // meme delire que le 1vs1 si possible d'avoir la meme page
    // sinon go get le display du lobby 2vs2 et mettre les gens en fonction du joueur
}

function joinLocalGame()
{
    console.log("local game");
    // direct lancer la game en local
}

function joinTournament()
{
    console.log("tournament");
}