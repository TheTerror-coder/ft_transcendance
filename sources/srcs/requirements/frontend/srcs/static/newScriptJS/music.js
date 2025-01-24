let currentSound = false;

let musicFlood = 0;

async function fadeOut() 
{
	const fadeDuration = 5000;
	const fadeSteps = 100;
	const fadeInterval = fadeDuration / fadeSteps;

	let currentStep = 0;
	return new Promise((resolve) => {
		const fadeIntervalId = setInterval(() => {
		const volume = 1 - (currentStep / fadeSteps);
		ELEMENTs.musicPlayer().volume = volume;

		// Increment step
		currentStep += 4;

		// Clear the interval when volume reaches 0
		if (currentStep >= fadeSteps) 
		{
			clearInterval(fadeIntervalId);
			ELEMENTs.musicPlayer().pause();
			resolve();
		}
		}, fadeInterval);
	});
}

async function changeMusic(newSource) 
{
	if (currentSound === true)
		musicFlood++;
	else
		musicFlood = 0;
	return new Promise(async (resolve) => {
		if (musicFlood > 1 || (ELEMENTs.music().src && ELEMENTs.music().src === BASE_URL + newSource))
		{
			resolve();
			return ;
		}
		if (!ELEMENTs.musicPlayer().paused)
			await fadeOut();
		let newSourceElement = document.createElement('source');
		newSourceElement.src = newSource;
		newSourceElement.type = 'audio/mp3';
		newSourceElement.id = "music";
		
		ELEMENTs.musicPlayer().innerHTML = '';
		
		ELEMENTs.musicPlayer().appendChild(newSourceElement);
		
		ELEMENTs.musicPlayer().load();
		musicFlood = 0;
		refreshMusic();
		resolve();
	})
}

function OnOffMusic() 
{
	if (ELEMENTs.musicPlayer().paused)
	{
		ELEMENTs.musicPlayer().play();
		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOn.png";
		ELEMENTs.buttonSound().alt = "sound is on !";
		currentSound = true;
	}
	else
	{
		ELEMENTs.musicPlayer().pause();
		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOff.png";
		ELEMENTs.buttonSound().alt = "sound is off !";
		currentSound = false;
	} 
}

function refreshMusic()
{
	ELEMENTs.musicPlayer().volume = 1;
	if (currentSound === true)
	{
		ELEMENTs.musicPlayer().play();
		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOn.png";
		ELEMENTs.buttonSound().alt = "sound is on !";
	}
	else
	{
		ELEMENTs.musicPlayer().pause();
		ELEMENTs.buttonSound().src = "/static/photos/picturePng/soundOff.png";
		ELEMENTs.buttonSound().alt = "sound is off !";
	}
}
