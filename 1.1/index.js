'use strict';

const { init } = require(__dirname + '/../common/utils.js');

const { encryptedText, englishAnalysis } = init(__dirname);

const decrypted = new Array(256)
  .fill(0)
  .map((_, keyApplicant) =>
    encryptedText
      .map(symbol => String.fromCharCode(symbol.charCodeAt(0) ^ keyApplicant))
      .join('')
  )
  .sort((text1, text2) => englishAnalysis(text1) - englishAnalysis(text2))[0];

console.log(decrypted);
