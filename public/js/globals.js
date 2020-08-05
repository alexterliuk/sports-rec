// global variables
const baseURI = querySel('base').href;

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

const mainTableBlock = pickElem('mainTableBlock');

const parsedCssVars = (() => {
  const oneRem = parseInt(window.getComputedStyle(querySel('html')).fontSize, 10);
  const parsedVars = [];

  for (const stylesheet of document.styleSheets) {
    if (stylesheet.href.includes('variables.css')) {

      for (const rule of stylesheet.rules) {
        if (rule.selectorText === ':root') {
          rule.cssText.split(/:root { |; |}/)
            .filter(val => val)
            .forEach(val => {
              const entry = val.split(': ');
              const isDotAtStart = val => val[0] === '.';

              parsedVars.push({
                varKey: entry[0],
                varVal: entry[1],
                vals: entry[1].trim().split(' ').map(v => {
                  const result = {};
                  result.val = v.includes('var') ? v.split(/var\(|\)/)[1] : parseFloat(isDotAtStart(v) ? `0${v}` : v);
                  result.cssUnit = v.includes('var') ? '' : v === '0' ? 'px' : v.slice(v.search(/[a-z]/));

                  result.px = !result.val ? 0 : typeof result.val === 'string' ? null :
                    result.cssUnit === 'px' ? result.val : result.val * oneRem;

                  return result;
                }),
              });
            });
        }
      }
    }
  }

  // if instead of number a val is another CSS var, replace it with corresponding value of that var
  parsedVars.forEach(parsedVar => {
    const pointersToAnotherCssVars = parsedVar.vals.filter(v => typeof v.val === 'string');

    pointersToAnotherCssVars.forEach(pointer => {
      const foundCssVar = parsedVars.find(cssVar => cssVar.varKey === pointer.val);
      pointer.val = foundCssVar.vals[0].val;
      pointer.cssUnit = foundCssVar.vals[0].cssUnit;
      pointer.px = foundCssVar.vals[0].px;
    });
  });

  parsedVars.push({ varKey: 'oneRem', varVal: oneRem });

  return parsedVars;
})();
