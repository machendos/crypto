const fetch = require('node-fetch');

const URL = 'http://95.217.177.249/casino';

const ID = Math.floor(Math.random() * 1000000);
const createAcc = async () => {
  let result = {};
  while (!result.id) {
    await fetch(`${URL}/createacc?id=${ID}`)
      .then(res => res.json())
      .then(body => (result = body));
  }
};

const makeBet = (bet, number) =>
  fetch(`${URL}/playLcg?id=${ID}&bet=${bet}&number=${number}`)
    .then(res => res.json())
    .then(body => body);

const a = 1664525;
const c = 1013904223;
const moda = 2 ** 32;

const nextNumber = lastNumber => (a * lastNumber + c) % moda;

const breaker = async () => {
  await createAcc();
  const { realNumber } = await makeBet(1, 1);
  const { realNumber: realNumber2 } = await makeBet(
    999,
    nextNumber(realNumber)
  );

  console.log(await makeBet(999000, nextNumber(realNumber2)));
};

breaker();
