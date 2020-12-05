'use strict';

const { init, coincidenceIndex } = require(__dirname + '/../common/utils.js');

const { encryptedText, englishAnalysis } = init(__dirname);

const decodedEncrypted = Buffer.from(encryptedText.join(''), 'hex')
  .toString('latin1')
  .split('');

const KEY_LENGTH_LIMIT = 10;

const keyLengthApplicants = [];
new Array(KEY_LENGTH_LIMIT).fill().map((_, keyLengthApplicant) => {
  const separatedRows = decodedEncrypted.reduce(
    (prev, curr, index) => (
      prev[index % keyLengthApplicant || 0].push(curr), prev
    ),
    new Array(keyLengthApplicant || 1).fill().map(() => [])
  );
  keyLengthApplicants.push({
    keyLengthApplicant,
    res: separatedRows.map(row =>
      coincidenceIndex(new Set(decodedEncrypted), row)
    ),
  });
});
console.log(keyLengthApplicants);

const sortedKeyLengthApplicant = keyLengthApplicants
  .map(({ keyLengthApplicant, res }) => ({
    keyLengthApplicant,
    res: res.reduce((prev, curr) => prev + curr) / res.length,
  }))
  .sort(({ res: res1 }, { res: res2 }) => res2 - res1);

const estimateKeyLength = sortedKeyLengthApplicant[0].keyLengthApplicant;

const separatedRows = decodedEncrypted.reduce(
  (prev, curr, index) => (prev[index % estimateKeyLength].push(curr), prev),
  new Array(estimateKeyLength).fill().map(() => [])
);

const key = separatedRows
  .map(row =>
    new Array(255)
      .fill()
      .map((_, symbolApplicantCode) => ({
        frequencyAnalysis: englishAnalysis(
          row.map(symbol =>
            String.fromCharCode(symbol.charCodeAt(0) ^ symbolApplicantCode)
          )
        ),
        key: String.fromCharCode(symbolApplicantCode),
      }))
      .sort(
        ({ frequencyAnalysis: key1 }, { frequencyAnalysis: key2 }) =>
          key1 - key2
      )
  )
  .map(([{ key }]) => key);

console.log(
  decodedEncrypted
    .map((element, index) =>
      String.fromCharCode(
        element.charCodeAt(0) ^ key[index % key.length].charCodeAt(0)
      )
    )
    .join('')
);
