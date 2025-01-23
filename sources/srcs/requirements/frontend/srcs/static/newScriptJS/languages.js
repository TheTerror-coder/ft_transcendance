
let translations = {};
let currentLanguage = 'en';

// Load translations from JSON
async function loadLanguages() 
{
    const response = await fetch('/static/newScriptJS/languages.json');
    translations = await response.json();
    refreshLanguage();
}

async function refreshLanguage()
{
    const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.GETLANGUAGE, user);
    if (response.status === 'success')
    {
        currentLanguage = response.language;
    }
    if (translations[currentLanguage])
        updateUI(currentLanguage);
    else
        console.log('Language not found');
}

async function setLanguage(lang) 
{
    if (translations[lang])
    {
        const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
        const data = {
            "language": lang,
            "username": user.username,
        };
        currentLanguage = lang;
        const response = await makeRequest('POST', URLs.USERMANAGEMENT.SETLANGUAGE, data);
        refreshLanguage();
    }
}

// Translate a specific key
function translate(key) 
{
    return translations[currentLanguage][key] || key;
}

// Update UI with current language translations
function updateUI(lang) 
{
    const translateElements = document.querySelectorAll('[data-translate]');
	if (ELEMENTs.dropDownLanguage())
    	ELEMENTs.dropDownLanguage().src = `/static/photos/picturePng/loginPage/drapeau/flag${lang}.png`;

    translateElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translatedText = translate(key);
        element.textContent = translatedText;
        if (element.placeholder != null)
            element.placeholder = translatedText;
    });
}


function languagePopOver()
{
    const popOverLanguage = document.createElement('li');
    popOverLanguage.className = 'dropdown-item d-flex justify-content-between align-items-center info-dropdownMenu';
    let englandFlag;
    let frenchFlag;
    let spainFlag;
    popOverLanguage.id = "popOverLanguage";
    if (currentLanguage === 'en')
    {
        console.log("dans le if de en");
        spainFlag = document.createElement('img');
        frenchFlag = document.createElement('img');
        frenchFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagfr.png";
        frenchFlag.id = "franceFlag"
        spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
        spainFlag.id = "spainFlag";
        console.log("spainFlag: ", spainFlag);
        console.log("frenchFlag: ", frenchFlag);

        popOverLanguage.appendChild(spainFlag);
        popOverLanguage.appendChild(frenchFlag);
        popOverLanguage.style.display = "flex";
        popOverLanguage.style.flexDirection = "column";
        console.log("popOverLanguage: ", popOverLanguage);
    }
    else if (currentLanguage === 'es')
    {
        console.log("dans le if de es");
        englandFlag = document.createElement('img');
        frenchFlag = document.createElement('img');
        frenchFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagfr.png";
        frenchFlag.id = "franceFlag"
        englandFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagen.png";
        englandFlag.id = "englandFlagImg";
        popOverLanguage.appendChild(englandFlag);
        popOverLanguage.appendChild(frenchFlag);
        popOverLanguage.style.display = "flex";
        popOverLanguage.style.flexDirection = "column";
    }
    else
    {
        console.log("dans le if de fr");
        englandFlag = document.createElement('img');
        spainFlag = document.createElement('img');
        spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
        spainFlag.id = "spainFlag"
        englandFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagen.png";
        englandFlag.id = "englandFlagImg";
        popOverLanguage.appendChild(englandFlag);
        popOverLanguage.appendChild(spainFlag);
        popOverLanguage.style.display = "flex";
        popOverLanguage.style.flexDirection = "column";
    }
    ELEMENTs.dropDownLanguage().appendChild(popOverLanguage);
    console.log("ELEMENTs.dropDownLanguage(), : ", ELEMENTs.dropDownLanguage());
}



document.addEventListener('click', async (event) => 
{
    if(ELEMENTs.dropDownLanguage() === event.target)
    {
        // languagePopOver();
        const popoverContainer = document.createElement('div');
        popoverContainer.id = "popOverLanguage";
        const rect = ELEMENTs.languageDiv().getBoundingClientRect();
        popoverContainer.style.position = 'absolute';
        popoverContainer.style.top = `${rect.top + window.scrollY + 35}px`;
        popoverContainer.style.left = `${rect.left + window.scrollX - 5}px`;
        popoverContainer.style.zIndex = 10;
        popoverContainer.style.width = '40px';
        popoverContainer.style.height = '80px';
        if (document.getElementById('popOverLanguage') === null)
        {
            if (currentLanguage === 'en')
            {
                const spainFlag = document.createElement('img');
                const frenchFlag = document.createElement('img');
                frenchFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagfr.png";
                frenchFlag.id = "franceFlag"
                spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
                spainFlag.id = "spainFlag";
                frenchFlag.style.alignSelf = "center";
                spainFlag.style.alignSelf = "center";
                spainFlag.style.marginTop = "5px";
                frenchFlag.style.marginBottom = "5px";
                popoverContainer.appendChild(spainFlag);
                popoverContainer.appendChild(frenchFlag);
                ELEMENTs.languageDiv().appendChild(popoverContainer);
            }
            else if (currentLanguage === 'es')
            {
                const englandFlag = document.createElement('img');
                const frenchFlag = document.createElement('img');
                frenchFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagfr.png";
                frenchFlag.id = "franceFlag"
                englandFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagen.png";
                englandFlag.id = "englandFlag";
                frenchFlag.style.alignSelf = "center";
                englandFlag.style.alignSelf = "center";
                englandFlag.style.marginTop = "5px";
                frenchFlag.style.marginBottom = "5px";
                popoverContainer.appendChild(englandFlag);
                popoverContainer.appendChild(frenchFlag);
                ELEMENTs.languageDiv().appendChild(popoverContainer);
            }
            else
            {
                const englandFlag = document.createElement('img');
                const spainFlag = document.createElement('img');
                spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
                spainFlag.id = "spainFlag"
                englandFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagen.png";
                englandFlag.id = "englandFlag";
                spainFlag.style.alignSelf = "center";
                englandFlag.style.alignSelf = "center";
                englandFlag.style.marginTop = "5px";
                spainFlag.style.marginBottom = "5px";
                popoverContainer.appendChild(englandFlag);
                popoverContainer.appendChild(spainFlag);
                ELEMENTs.languageDiv().appendChild(popoverContainer);
            }
            popoverContainer.style.display = "flex";
            popoverContainer.style.flexDirection = "column";
            popoverContainer.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            popoverContainer.style.justifyContent = "space-between";
        }
        else
            document.getElementById('popOverLanguage').remove();

    }
    else if (document.getElementById('popOverLanguage') !== null )
    {
        if (event.target === ELEMENTs.spainFlag())
            setLanguage('es');
        else if (event.target === ELEMENTs.franceFlag())
            setLanguage('fr');
        else if (event.target === ELEMENTs.englandFlag())
            setLanguage('en');
        document.getElementById('popOverLanguage').remove();
    }
});

function updatePopoverPosition() 
{
    if (document.getElementById('popOverLanguage') !== null)
    {
        const popoverContainer = document.getElementById('popOverLanguage');
        const rect = ELEMENTs.languageDiv().getBoundingClientRect();
        popoverContainer.style.position = 'absolute';
        popoverContainer.style.top = `${rect.top + window.scrollY + 35}px`;
        popoverContainer.style.left = `${rect.left + window.scrollX - 5}px`;
        popoverContainer.style.zIndex = 10;
        popoverContainer.style.width = '40px';
        popoverContainer.style.height = '80px';
    }
}

// Recalculate position when the window is resized
window.addEventListener('resize', updatePopoverPosition);


// Initialize on page load
document.addEventListener('DOMContentLoaded', loadLanguages);