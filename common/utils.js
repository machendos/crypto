'use strict';

const { readFileSync } = require('fs');

const symbolsFrequencies = require(__dirname +
  '/../common/symbols-frequencies.json');

const frequencyAnalysis = (expectedFrequencies, text) =>
  Object.entries(expectedFrequencies).reduce(
    (result, [symbol, expectedFrequency]) =>
      result +
      ((text.join('').split(symbol).length - 1) / text.length -
        expectedFrequency) **
        2,
    0
  );

const englishAnalysis = frequencyAnalysis.bind(null, symbolsFrequencies);

const init = dirname => ({
  symbolsFrequencies,
  englishAnalysis,
  alphabet: Object.keys(symbolsFrequencies),
  encryptedText: readFileSync(dirname + '/encrypted.txt')
    .toString()
    .split(''),
});

const coincidenceIndex = (alphabet, text) =>
  [...alphabet].reduce(
    (prev, symbol) =>
      prev + text.filter(el => el === symbol).length ** 2 / text.length ** 2,
    0
  );

module.exports = {
  englishAnalysis,
  init,
  coincidenceIndex,
};
