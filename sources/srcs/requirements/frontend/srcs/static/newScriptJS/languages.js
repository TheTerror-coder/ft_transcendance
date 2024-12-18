


//TO DO: fetech the language and keep it in db



// languageSwitcher.js
let translations = {};
let currentLanguage = 'en';

// Load translations from JSON
async function loadLanguages() {
    const response = await fetch('/static/newScriptJS/languages.json');
    translations = await response.json();
}

// Set current language
async function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang; // a mettre dans la db aussi
        updateUI();
    } else {
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
    
    translateElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translate(key);
    });
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', loadLanguages);