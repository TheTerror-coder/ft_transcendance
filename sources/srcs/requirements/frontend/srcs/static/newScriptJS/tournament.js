
function joinTournamentDisplay()
{
    ELEMENTs.centerTournament().innerHTML = joinTournamentVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
    refreshLanguage();
}

function createTournament()
{
    ELEMENTs.centerTournament().innerHTML = tournamentPageDisplayVAR;
    ELEMENTs.centerTournament().style.justifyItems = "center";
    refreshLanguage();

    for (let i = 0; i < 8; i++)
    {
        const usernameTournament = "dbaule" + i; // represente le blaze des differents pelo
        console.log("usernameTournament : ", usernameTournament);
        addUserTournament(usernameTournament, i);
        
    }
    
}

// i sera le nombre de joueur qui ont rejoins en tout le tournois

async function addUserTournament(usernameTournament, i)
{
    const div = document.createElement("div");
    div.className = "tournamentPlayer";
    const p = document.createElement("p");
    p.innerHTML = usernameTournament;
    p.className = "usernameTournament";
    div.appendChild(p);
    ELEMENTs.tournamentContent().appendChild(div);
    ELEMENTs.numbersOfPlayersTournament().innerHTML = i + 1; // a remplacer avec les infos que je vais recup de ben
    if (i === 7)
    {
        ELEMENTs.startTournament().style.display = "flex";
        ELEMENTs.startTournament().onclick = () => startTournament();
        document.getElementsByClassName("writeNumbersOfPlayers")[0].style.color = "rgba(51, 201, 6, 0.9)";
        ELEMENTs.tournamentWrite().innerHTML = "";
        displayBinaryTree();
    }
}

function displayBinaryTree()
{
    console.log("display binary tree");
    ELEMENTs.forLetPlaceTree().innerHTML = binaryTreeVAR;

    // document.querySelectorAll(`[data-match="${i}"]`).forEach(function(element) {
    //     console.log(element);
    //   });
    setTimeout(() => {
        document.querySelectorAll('[data-match="1"]').forEach(function(element) 
        {
            element.innerHTML = "dbaule0";
            if (element.hasAttribute("data-translate"))
                element.removeAttribute('data-translate');
        });
    }, 500);
}

function startTournament()
{
    console.log("start tournament");
}