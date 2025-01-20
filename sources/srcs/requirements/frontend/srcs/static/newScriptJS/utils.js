
// let currentSound = true;

// function changeMusic(newSource) 
// {
//     let newSourceElement = document.createElement('source');
//     newSourceElement.src = newSource;
//     newSourceElement.type = 'audio/mp3';

//     ELEMENTs.musicPlayer().innerHTML = '';

//     ELEMENTs.musicPlayer().appendChild(newSourceElement);

//     ELEMENTs.musicPlayer().load();
// 	console.log("currentSound dans changeMusic: ", currentSound);
// 	refreshMusic();
// }

// function OnOffMusic() 
// {
// 	if (ELEMENTs.musicPlayer().paused)
// 	{
// 		ELEMENTs.musicPlayer().play();
// 		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOn.png";
// 		ELEMENTs.buttonSound().alt = "sound is on !";
// 		currentSound = true;
// 	}
// 	else
// 	{
// 		ELEMENTs.musicPlayer().pause();
// 		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOff.png";
// 		ELEMENTs.buttonSound().alt = "sound is off !";
// 		currentSound = false;
// 	} 
// }

// function refreshMusic()
// {
// 	if (currentSound === true)
// 		ELEMENTs.musicPlayer().play();
// 	else
// 		ELEMENTs.musicPlayer().pause();
// }