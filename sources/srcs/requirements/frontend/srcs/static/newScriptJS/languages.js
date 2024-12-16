


//TO DO: fetech the language and keep it in db



// languageSwitcher.js
let translations = {};
let currentLanguage = 'en';

// Load translations from JSON
async function loadLanguages() {
    const response = await fetch('/static/newScriptJS/languages.json');
    ELEMENTs.dropDownLanguage().src = `/static/photos/picturePng/loginPage/drapeau/flag${currentLanguage}.png`;
    translations = await response.json();
}

// Set current language
async function setLanguage(lang) 
{
    if (translations[lang])
    {
        currentLanguage = lang;
        updateUI();
    }
    else 
    {
        console.error(`Language ${lang} not found`);
    }
}

// Translate a specific key
function translate(key) {
    return translations[currentLanguage][key] || key;
}

// Update UI with current language translations
function updateUI() {
    const translateElements = document.querySelectorAll('[data-translate]');
    ELEMENTs.dropDownLanguage().src = `/static/photos/picturePng/loginPage/drapeau/flag${currentLanguage}.png`;
    
    translateElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translate(key);
    });
}


function languagePopOver()
{
    const popOverLanguage = document.createElement('div');
    popOverLanguage.id = "popOverLanguage";
    console.log("valeur de current language: ", currentLanguage);
    if (currentLanguage === 'en')
    {
        const spainFlag = document.createElement('img');
        const frenchFlag = document.createElement('img');
        frenchFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagfr.png";
        frenchFlag.id = "franceFlag"
        spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
        spainFlag.id = "spainFlag";
        popOverLanguage.appendChild(spainFlag);
        popOverLanguage.appendChild(frenchFlag);
        popOverLanguage.style.display = "flex";
        popOverLanguage.style.flexDirection = "column";
    }
    else if (currentLanguage === 'es')
    {
        const englandFlag = document.createElement('img');
        const frenchFlag = document.createElement('img');
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
        const englandFlag = document.createElement('img');
        const spainFlag = document.createElement('img');
        spainFlag.src = "/static/photos/picturePng/loginPage/drapeau/flages.png";
        spainFlag.id = "spainFlag"
        englandFlag.src = "/static/photos/picturePng/loginPage/drapeau/flagen.png";
        englandFlag.id = "englandFlagImg";
        popOverLanguage.appendChild(englandFlag);
        popOverLanguage.appendChild(spainFlag);
        popOverLanguage.style.display = "flex";
        popOverLanguage.style.flexDirection = "column";
    }
    console.log("AVANT LE DROP DOWN GANG");
    ELEMENTs.dropDownLanguage().appendChild(popOverLanguage);
    console.log("APRES LE DROP DOWN GANG");
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', loadLanguages);