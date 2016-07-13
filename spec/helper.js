var _ = require('lodash');

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomCodes() {
  return _(148).range().map(() => {
    let a = _.padStart(getRandomNumber(0, 9999), 4, 0);
    let b = _.padStart(getRandomNumber(0, 999999), 6, 0);
    return [a, b];
  })
  .sortBy('[0]').value();
}
