# Nodeit

## Synopsis

A simple tool that wraps functions from js files and export them as a node module.

## Install

All you need is to add nodeit to your devDependencies in `package.json` file.
you can use your package manager to do so:

```bash
npm install --save-dev nodeit
```

or

```bash
yarn add --dev nodeit
```

## How it works

Supposing, you have a file `src/Calculator.js` that contains the following code:

```js
function sum (a, b) {
    return a+b;
}
```

```js
const calculator = require('nodeit')
    .compile('src/Calculator');

describe('Calculator', () => {
    it('should return 4 as sum(1,3)',()=>{
        expect(calculator.sum(2,2)).toEqual(4);
    })
});
```
