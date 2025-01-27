// ici je recupere les elements de fin de match de chaqu'un des deux joueurs
// je fetch les elements de fin de match de chaqu'un des deux joueurs
// j'applique les modif de stat pour chaqu'un des deux joueurs
// je fetch les elements de chaque joueur


let getWantedLobby = 
{
    _user: [],

    get users() {
        return this._user;
    },

    set users(value) 
	{
		this._user.push(value);
		if (document.getElementById("winnerOfTheTournament"))
			displayBinaryTree();
	},
	clearUsers() {
		this._user = [];
	}
};

async function updateLobby(data, disconnect)
{
	if (disconnect === true)
	{
		if (document.getElementById("lobbyCode") !== null)
		{
			let usernameToDelete = null;
			let elements = document.querySelectorAll('[id^="usernameOfWanted"]');

			elements.forEach(element => {
				let flag = false;
				if (data[1].length != 0)
				{
					for (let it = 0; it < data[1].length; it++) 
					{
						console.log("premiere boucle gang: ", element.textContent);
						if (element.textContent === data[1][it].name) 
						{
							console.log('Found in data[0]');
							flag = true;
							break;
						}
					}
				}
				if (flag === false)
				{
					if (data[2].length != 0)
					{
						for (let it = 0; it < data[2].length; it++) 
						{
							console.log("deuxieme boucle: ", element.textContent);
							if (element.textContent === data[2][it].name) 
							{
								console.log('Found in data[1]');
								flag = true;
								break;
							}
						}
					}
				}
				if (flag === false)
				{
					
					let toDelete = document.querySelectorAll('[id^="usernameOfWanted"]');

					toDelete.forEach(del => {
						if (del.textContent === element.textContent)
						{		
							console.log("dans le supprimer: `del.id`", del.id);
							const num = del.id[del.id.length - 1];
							console.log("num ta capter: ", num);
							document.getElementById(`lobbyDisplayRapidPlayPlayer${num}`).innerHTML = waitingPlayer;
						}
					});
					return ;
				}
			});
		}
	}
    if (nbPerTeam === 1 && data[2].length === 1) // marche bien !
    {
        await updateLobbyOneVsOne(data);
        // TODO regarder si le lobby est plein
        if (ELEMENTs.PlayButtonInLobby())
            ELEMENTs.PlayButtonInLobby().onclick = () => startGameLobby();

    }
    else if (nbPerTeam === 2)
    {
        if (document.getElementById("lobbyCode") !== null)
        {
            await updateLobbyTwoVsTwo(data);
            if (ELEMENTs.PlayButtonInLobby())
                ELEMENTs.PlayButtonInLobby().onclick = () => startGameLobby();
        }
    }
}
 
async function updateLobbyOneVsOne(data)
{
    const user1 = {"username": data[1][0].name};
    const responseCreator = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user1);
    if (data[2].length === 1)
    {
        const user2 = {"username": data[2][0].name};
        if (ELEMENTs.lobbyDisplayRapidPlayPlayerTwo() !== null)
        {

            ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;
            if (data[2].length === 1)
            {
                const imgElement2 = document.getElementById("pictureOfWanted2");
                const response = await makeRequest('POST', URLs.USERMANAGEMENT.GETUSERPROFILE, user2);
                const photoUrl2 = response.user_info.photo;
                imgElement2.src = photoUrl2;
                document.getElementById("usernameOfWanted2").innerHTML = data[2][0].name;
                let primeAmount2 = response.user_info.prime;
                if (response.user_info.prime === null)
                    primeAmount2 = 0;
                document.getElementById("primeAmount2").innerHTML = primeAmount2;
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

    const photoUrl = userResponse.user_info.photo;
    imgElement.src = photoUrl;
    document.getElementById(`usernameOfWanted${position}`).innerHTML = user.username;
    let primeAmount = userResponse.user_info.prime;
    if (userResponse.user_info.prime === null)
        primeAmount = 0;
    document.getElementById(`primeAmount${position}`).innerHTML = primeAmount;
}

async function updateLobbyTwoVsTwo(data)
{
    if (data[1] && data[1][0] && data[1][0].name !== undefined)
    {
        const user = {"username": data[1][0].name};
        const pos = data[1][0].role === "captain" ? 1 : 2;
        pos === 1 ? ELEMENTs.lobbyDisplayRapidPlayPlayerOne().innerHTML = wantedPlayerOne : ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;
        await setwantedProfileInLobby(user, pos);
    }
    if (data[1] && data[1][1] && data[1][1].name !== undefined)
    {
        const user = {"username": data[1][1].name};
        ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;
        const pos = data[1][1].role === "captain" ? 1 : 2;
        pos === 1 ? ELEMENTs.lobbyDisplayRapidPlayPlayerOne().innerHTML = wantedPlayerOne : ELEMENTs.lobbyDisplayRapidPlayPlayerTwo().innerHTML = wantedPlayerTwo;

        await setwantedProfileInLobby(user, pos);
    }
    if (data[2] && data[2][0] && data[2][0].name !== undefined)
    {
        const user = {"username": data[2][0].name};
        const pos = data[2][0].role === "captain" ? 3 : 4;
        pos === 3 ? ELEMENTs.lobbyDisplayRapidPlayPlayerThree().innerHTML = wantedPlayerThree : ELEMENTs.lobbyDisplayRapidPlayPlayerFour().innerHTML = wantedPlayerFour;
        await setwantedProfileInLobby(user, pos);
    }
    if (data[2] && data[2][1] && data[2][1].name !== undefined)
    {
        const user = {"username": data[2][1].name};
        const pos = data[2][1].role === "captain" ? 3 : 4;
        pos === 3 ? ELEMENTs.lobbyDisplayRapidPlayPlayerThree().innerHTML = wantedPlayerThree : ELEMENTs.lobbyDisplayRapidPlayPlayerFour().innerHTML = wantedPlayerFour;
        await setwantedProfileInLobby(user, pos);
    }
}

function startGameLobby()
{
    globalSocket.emit('launchGame', savedGameCode.code);
}