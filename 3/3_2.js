'use strict';
import {createRequire} from 'module'

const require = createRequire(import.meta.url);
const fetch = require('node-fetch');
import {MersenneTwister} from "fast-mersenne-twister";

const URL = 'http://95.217.177.249/casino';

const createAcc = async () => {
    return await fetch(`${URL}/createacc?id=${ID}`)
        .then(res => res.json())
        .then(text => {
            console.log(text);
            return text;
        });
};
const makeBet = async (bet, number, mode) => {
    return await fetch(`${URL}/play${mode}?id=${ID}&bet=${bet}&number=${number}`)
        .then(res => res.json())
        .then(text => {
            console.log(text);
            return text;
        });
};

const ID = Math.floor(Math.random() * 1000000);

const breakMt = async () => {
    console.log("ID:", ID);
    const start = Math.floor(Date.now()/1000);
    await createAcc();
    const {realNumber} = await makeBet(1, 1, 'Mt');
    let goodTwister;
    for (let i = 0; i < 10; i++) {
        const twister = MersenneTwister(start-3+i);
        let n = twister.randomNumber();
        if(n === realNumber) goodTwister = twister;
    }
    if(!goodTwister) {
        console.log(`Couldn't find the correct twister`);
        process.exit();
    } else {
        const num2 = goodTwister.randomNumber();
        const num3 = goodTwister.randomNumber();
        await makeBet(999, num2, 'Mt');
        await makeBet(999000, num3, 'Mt');
    }
    console.log(`It took  ${Math.floor(Date.now()/1000) - start} seconds`);
};
breakMt();