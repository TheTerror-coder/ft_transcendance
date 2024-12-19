


//TO DO: fetech the language and keep it in db



// languageSwitcher.js
let translations = {};
let currentLanguage = 'en';

// Load translations from JSON
async function loadLanguages() 
{
    const response = await fetch('/static/newScriptJS/languages.json');
    ELEMENTs.dropDownLanguage().src = `/static/photos/picturePng/loginPage/drapeau/flag${currentLanguage}.png`;
    translations = await response.json();
}

async function refreshLanguage()
{
    if (translations[currentLanguage])
    {
        currentLanguage = currentLanguage;
        updateUI();
    }
}

// Set current language
async function setLanguage(lang) 
{
    if (lang !== currentLanguage)
    {
        if (translations[lang])
        {
            currentLanguage = lang;
            updateUI();
        }
        else
            console.error(`Language ${lang} not found`);
    }
}

// Translate a specific key
function translate(key) 
{
    return translations[currentLanguage][key] || key;
}

// Update UI with current language translations
function updateUI() 
{
    const translateElements = document.querySelectorAll('[data-translate]');
    ELEMENTs.dropDownLanguage().src = `/static/photos/picturePng/loginPage/drapeau/flag${currentLanguage}.png`;

    translateElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translate(key);
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
    console.log("valeur de current language: ", currentLanguage);
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
    console.log("QUDN JE CLIAUE NORMQLEMENT: ", event.target);
    if(ELEMENTs.dropDownLanguage() === event.target)
    {
        // languagePopOver();
        if (document.getElementById('popOverLanguage') === null)
        {
            console.log("click on dropDownLanguage");
            const popoverContainer = document.createElement('div');
            popoverContainer.id = "popOverLanguage";
            const rect = ELEMENTs.languageDiv().getBoundingClientRect();
            popoverContainer.style.position = 'absolute';
            popoverContainer.style.top = `${rect.top + window.scrollY}px`;
            popoverContainer.style.left = `${rect.left + window.scrollX + 10}px`;
            popoverContainer.style.zIndex = 1;
            popoverContainer.style.width = '150px';
            popoverContainer.style.height = '20px';
            const spainFlag = document.createElement('img');
            const frenchFlag = document.createElement('img');
            frenchFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagfr.png";
            frenchFlag.id = "franceFlag"
            spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
            spainFlag.id = "spainFlag";
            popoverContainer.appendChild(spainFlag);
            popoverContainer.appendChild(frenchFlag);
            popoverContainer.style.display = "flex";
            popoverContainer.style.flexDirection = "column";
            ELEMENTs.languageDiv().appendChild(popoverContainer);
        }
        else
        {
            console.log("gang remove document.getElementById('popOverLanguage') ");
            document.getElementById('popOverLanguage').remove();
        }

    }
    else if (document.getElementById('popOverLanguage') !== null)
    {
        console.log("remove qund tu clique ailleur lol");
        document.getElementById('popOverLanguage').remove();
    }
});



// Initialize on page load
document.addEventListener('DOMContentLoaded', loadLanguages);