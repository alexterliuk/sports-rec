/**
 * showDaysWithoutSugar
 */
function showDaysWithoutSugar(id) {
  setTimeout(() => {
    const Apr24 = new Date('Apr 24, 2020');
    const currentDate = new Date();
    const daysElapsed = ((currentDate - Apr24) / (60 * 60 * 24 * 1000)).toFixed();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDateString = `${months[currentDate.getMonth()]} ${currentDate.getDate()}`;

    const elem = document.getElementById(id);
    const text = 'Previous period without sugar: Mar 3 - Apr 18 (47 days). ';
    if (elem) elem.textContent = text + `Current period without sugar: Apr 24 - ${currentDateString} end (${daysElapsed} days) (NB: on May 12-13 I ate cake).`;

  }, 50);
}
