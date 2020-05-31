// global variables
const pickElem = id => document.getElementById(id);
const querySel = sel => document.querySelector(sel);

const signInForm = querySel('#signInPanel form');
const signInPanel = pickElem('signInPanel');
const signInUsername = pickElem('signInUsername');
const signInPassword = pickElem('signInPassword');

const signUpForm = querySel('#signUpPanel form');
const signUpPanel = pickElem('signUpPanel');
const signUpUsername = pickElem('signUpUsername');
const signUpPassword = pickElem('signUpPassword');

const logInPanel = pickElem('logInPanel');
const welcomeMessage = pickElem('welcomeMessage');
