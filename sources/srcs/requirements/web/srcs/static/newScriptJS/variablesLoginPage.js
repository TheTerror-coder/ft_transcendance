

const loginPage = document.querySelector("#loginPage");

// FLAG
const englandFlag = document.querySelector("#englandFlag");
const spainFlag = document.querySelector("#spainFlag");
const franceFlag = document.querySelector("#franceFlag");

let flagSelected = "en";


//LOGIN PAGE information
const loginButton = document.querySelector("#loginButton");
const woodPresentation = document.querySelector("#woodPresentation");
const background = document.querySelector("#background");
const flag = document.querySelector("#flag");


// CONNEXION VARIABLE
const buttonConnectionAPI42 = document.querySelector("#connectionApi");
const buttonConnec = document.querySelector("#connectionEmail");
const buttonCreateAccount = document.querySelector("#createAnAccount");

const createAccountChange = document.querySelector("#formAccount");


const formConnect = document.querySelector("#formConnect");


let createAccountForm;


// "refresh" page variable
const buttonRefreshPage = document.querySelector('#refreshPage');

class loginPageClass {
    constructor() {
        this.flagSelected = "en";
        this.loginButton = document.querySelector("#loginButton");
        this.woodPresentation = document.querySelector("#woodPresentation");
        this.background = document.querySelector("#background");
        this.flag = document.querySelector("#flag");
        this.buttonConnectionAPI42 = document.querySelector("#connectionApi");
        this.buttonConnec = document.querySelector("#connectionEmail");
        this.buttonCreateAccount = document.querySelector("#createAnAccount");
        this.createAccountChange = document.querySelector("#formAccount");
        this.formConnect = document.querySelector("#formConnect");
        this.createAccountForm;
        this.buttonRefreshPage = document.querySelector('#refreshPage');
    }
}