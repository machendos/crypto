'use strict';
import {createRequire} from 'module'

const require = createRequire(import.meta.url);
const fetch = require('node-fetch');
const fs = require('fs');
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
            // console.log(text);
            return text;
        });
};

const ID = Math.floor(Math.random() * 1000000);

class Untwister {
    N = 624;  //624 values (of 32bit) is just enough to reconstruct the internal state
    M = 397;
    MATRIX_A = 0x9908b0df;
    UPPER_MASK = 0x80000000;
    LOWER_MASK = 0x7fffffff;
    nextPos = 0;
    state = [];

    constructor(temperedState) {
        for (let i = 0; i < 624; i++) {
            this.state.push(this.untemper(temperedState[i]));
        }
    };

    getUntemperedState() {
        return this.state;
    };

    temper = (y) => {
        y ^= (y >> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >> 18);
        return y;
    };
    untemper = (y) => {
        y ^= (y >> 18);
        y ^= (y << 15) & 0xefc60000;
        y ^= ((y << 7) & 0x9d2c5680) ^ ((y << 14) & 0x94284000) ^ ((y << 21) & 0x14200000) ^ ((y << 28) & 0x10000000);
        y ^= (y >> 11) ^ (y >> 22);
        return y;
    };
    // MersenneTwister.prototype.int = function () {
    //     var y,
    //         kk,
    //         mag01 = new Array(0, MATRIX_A);
    //
    //     if (this.mti >= N) {
    //         if (this.mti === N + 1) {
    //             this.seed(5489);
    //         }
    //
    //         for (kk = 0; kk < N - M; kk++) {
    //             y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
    //             this.mt[kk] = this.mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1];
    //         }
    //
    //         for (; kk < N - 1; kk++) {
    //             y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
    //             this.mt[kk] = this.mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1];
    //         }
    //
    //         y = (this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK);
    //         this.mt[N - 1] = this.mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1];
    //         this.mti = 0;
    //     }
    //
    //     y = this.mt[this.mti++];
    //
    //     y ^= (y >>> 11);
    //     y ^= (y << 7) & 0x9d2c5680;
    //     y ^= (y << 15) & 0xefc60000;
    //     y ^= (y >>> 18);
    //
    //     return y >>> 0;
    // };
    generate = () => {
        let mag01 = [0x0, this.MATRIX_A];
        let y = (this.state[this.nextPos] & this.UPPER_MASK) | (this.state[(this.nextPos + 1) % this.N] & this.LOWER_MASK);
        this.state[this.nextPos] = this.state[(this.nextPos + this.M) % this.N] ^ (y >> 1) ^ mag01[y & 0x1];

    }

    getNextNum = () => {
        this.generate();
        const y = this.state[this.nextPos];
        this.nextPos = (this.nextPos + 1) % this.N;
        return this.temper(y);
    }
}

class Twister {
    N = 624;  //624 values (of 32bit) is just enough to reconstruct the internal state
    N_MINUS_1 = 623;
    M = 397;
    M_MINUS_1 = 396;
    DIFF = this.N - this.M;
    MATRIX_A = 0x9908b0df;
    UPPER_MASK = 0x80000000;
    LOWER_MASK = 0x7fffffff;
    state = [];
    next = 0;

    constructor(seed, state) {
        if (!state) {
            this.state = this.initialize(seed);

        } else {
            // console.log(state.length, this.state.length);
            let st = [];
            for (let i = 0; i < 624; i++) {
                st.push(state[i]);
            }
            this.state = st;
            this.next = 624;
        }
    }

    twist(state) {
        let bits;

        // first 624-397=227 words
        for (let i = 0; i < this.DIFF; i++) {
            bits = (state[i] & this.UPPER_MASK) | (state[i + 1] & this.LOWER_MASK);

            state[i] = state[i + this.M] ^ (bits >>> 1) ^ ((bits & 1) * this.MATRIX_A);
        }
        // remaining words (except the very last one)
        for (let i = this.DIFF; i < this.N_MINUS_1; i++) {
            bits = (state[i] & this.UPPER_MASK) | (state[i + 1] & this.LOWER_MASK);

            state[i] = state[i - this.DIFF] ^ (bits >>> 1) ^ ((bits & 1) * this.MATRIX_A);
        }

        // last word is computed pretty much the same way, but i + 1 must wrap around to 0
        bits = (state[this.N_MINUS_1] & this.UPPER_MASK) | (state[0] & this.LOWER_MASK);

        state[this.N_MINUS_1] = state[this.M_MINUS_1] ^ (bits >>> 1) ^ ((bits & 1) * this.MATRIX_A);

        return state;
    }

    initialize(seed = Date.now()) {
        const state = this.initializeWithNumber(seed);
        return this.twist(state);
    }

    initializeWithNumber(seed) {
        const N = 624;
        const state = new Array(N);

        // fill initial state
        state[0] = seed;
        for (let i = 1; i < N; i++) {
            let s = state[i - 1] ^ (state[i - 1] >>> 30);
            // avoid multiplication overflow: split 32 bits into 2x 16 bits and process them individually
            state[i] = (
                (
                    (
                        (
                            (s & 0xffff0000) >>> 16
                        ) * 1812433253
                    ) << 16
                ) + (s & 0x0000ffff) * 1812433253
            ) + i;
        }

        return state;
    }

    untemper = (y) => {
        y ^= (y >>> 18);
        y ^= (y << 15) & 0xefc60000;
        y ^= ((y << 7) & 0x9d2c5680) ^ ((y << 14) & 0x94284000) ^ ((y << 21) & 0x14200000) ^ ((y << 28) & 0x10000000);
        y ^= (y >>> 11) ^ (y >>> 22);
        return y;
    };

    randomInt32 = () => {
        let x;

        if (this.next >= this.N) {
            this.state = this.twist(this.state);
            this.next = 0;
        }

        x = this.state[this.next++];

        // Tempering
        x ^= x >>> 11;
        x ^= (x << 7) & 0x9d2c5680;
        x ^= (x << 15) & 0xefc60000;
        x ^= x >>> 18;

        // Convert to unsigned
        return x >>> 0;
    }
    rand = () => {
        let x;

        if (this.next >= this.N) {
            this.state = this.twist(this.state);
            this.next = 0;
        }

        x = this.state[this.next++];

        // Convert to unsigned
        return x;
    }
    randomNumber = this.randomInt32;
}

const untemper = (y) => {
    y = y << 0;
    y ^= (y >>> 18);
    y ^= (y << 15) & 0xefc60000;
    y ^= ((y << 7) & 0x9d2c5680) ^ ((y << 14) & 0x94284000) ^ ((y << 21) & 0x14200000) ^ ((y << 28) & 0x10000000);
    y ^= (y >>> 11) ^ (y >>> 22);
    return y;
};

const temper = (x) => {
    x ^= x >>> 11;
    x ^= (x << 7) & 0x9d2c5680;
    x ^= (x << 15) & 0xefc60000;
    x ^= x >>> 18;

    // Convert to unsigned
    return x >>> 0;
}

const getState = (twister) => {
    const state = [];
    // const untemperedState = [];
    for (let i = 0; i < 624; i++) {
        const num = twister.rand();
        state.push(num);
        // untemperedState.push(untemper(num));
    }
    return state;
}
const getUntemperedState = (twister) => {
    const state = [];
    // const untemperedState = [];
    for (let i = 0; i < 624; i++) {
        const num = twister.randomNumber();
        state.push(untemper(num));
        // untemperedState.push(untemper(num));
    }
    return state;
}
const getUntempered = (states) => {
    const state = [];
    // const untemperedState = [];
    for (let i = 0; i < 624; i++) {
        // const num = twister.randomNumber();
        state.push(untemper(states[i]));
        // untemperedState.push(untemper(num));
    }
    return state;
}

// let t = MersenneTwister(1);
// let a = getUntemperedState(t);
//
// let tt = new Twister(0, a);
// // console.log(t2.next, tt.next);
// console.log(t.randomNumber());
// console.log(tt.randomNumber());

const breakBetterMt = async () => {
    console.log("ID:", ID);
    await createAcc();
    let state = [];
    for (let i = 0; i < 624; i++) {
        if(i%100 === 0) console.log(i);
        const {realNumber} = await makeBet(1, 1, 'BetterMt');
        state.push(realNumber);
    }
    let untemp = getUntempered(state);
    let tt = new Twister(0, untemp);

    const num2 = tt.randomNumber();
    console.log(await makeBet(376, num2, 'BetterMt'));
    const num3 = tt.randomNumber();
    console.log( await makeBet(376000, num3, 'BetterMt'));

};

breakBetterMt();