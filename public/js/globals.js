// global variables
const pickElem = id => document.getElementById(id);
const pickTags = tag => document.getElementsByTagName(tag);
const querySel = sel => document.querySelector(sel);
const querySelAll = sel => document.querySelectorAll(sel);

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

const parsedCssVars = {};
for (const stylesheet of document.styleSheets) {
  if (stylesheet.href.includes('variables.css')) {

    for (const rule of stylesheet.rules) {
      if (rule.selectorText === ':root') {
        rule.cssText.split(/:root { |; |}/)
                    .filter(val => val)
                    .forEach(val => {
                      const entry = val.split(': ');
                      parsedCssVars[entry[0]] = entry[1];
                    });
      }
    }
  }
}
