# quirky-bools

Quirky package for immutable fuzzy booleans you can pass through a project. A `QBool` is a number from 0 to 1: a yes or no that has not made up its mind.

```js
const { qbool } = require('@mouseba11/quirky-bools');

qbool(0.7).and(0.4).not();
// QBool(0.60)
```

- **A value, not a container.** `not()`, `and()` and `or()` return a new `QBool`. The one you called them on does not change.
- **No dependencies.** Nothing to install besides the package.
- **Two ways in.** `qbool(0.7)` or `new QBool(0.7)`. Both make a `QBool`, and `instanceof QBool` is true for either.
- **Works from CommonJS and from ESM.**

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Creating a value](#creating-a-value)
- [Operations](#operations)
- [True or false](#true-or-false)
- [JSON and the console](#json-and-the-console)
- [Weighted average](#weighted-average)
- [API](#api)
- [Releasing](#releasing)
- [License](#license)

## Install

From the public npm registry:

```
npm install @mouseba11/quirky-bools
```

From [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry), add this to your project `.npmrc` (and authenticate with a classic PAT that has `read:packages`):

```
@mouseba11:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

Then:

```
npm install @mouseba11/quirky-bools
```

Requires Node 18 or later.

```js
const { qbool, QBool } = require('@mouseba11/quirky-bools');
```

```js
import { qbool, QBool } from '@mouseba11/quirky-bools';
```

## Quick start

```js
const { qbool } = require('@mouseba11/quirky-bools');

const raining = qbool(0.7);
const goingOut = qbool(0.4);

raining.and(goingOut);   // QBool(0.40)  the less sure of the two
raining.or(goingOut);    // QBool(0.70)  the more sure of the two
raining.not();           // QBool(0.30)

raining.and(goingOut).toBoolean();  // false, because 0.40 is under the 0.5 line
```

## Creating a value

```js
qbool(0.7);            // QBool(0.70), threshold 0.5
new QBool(0.7, 0.6);   // same value, true/false line at 0.6
qbool(qbool(0.7));     // the same instance back
```

Numbers outside 0 to 1 are pulled back in: `qbool(-5)` is 0 and `qbool(99)` is 1. `NaN`, `undefined` and any other non-number become 0. A non-number threshold is ignored and the line stays at 0.5. A numeric string such as `"0.25"` is read as a number.

| Preset | Value |
| --- | --- |
| `QBool.TRUE` / `qbool.TRUE` | 1 |
| `QBool.SORTA_TRUE` / `qbool.SORTA_TRUE` | 0.75 |
| `QBool.MEH` / `qbool.MEH` | 0.5 |
| `QBool.SORTA_FALSE` / `qbool.SORTA_FALSE` | 0.25 |
| `QBool.FALSE` / `qbool.FALSE` | 0 |

## Operations

`and` keeps the smaller certainty. `or` keeps the larger. Both accept more than one argument, and each argument may be a `QBool` or a number. `not` is `1 - value`.

The threshold on the result is the threshold of the value you called the method on.

```js
qbool(0.2, 0.6).and(0.8).threshold;  // 0.6
```

## True or false

`toBoolean()` is `true` when `value` is at least `threshold`. The default line is 0.5, and a value sitting on the line counts as true.

`if (qbool(0))` does not work. A `QBool` is an object, and JavaScript treats every object as true. Use `toBoolean()`, or read `.value`.

`Number(qbool(0.7))` and `+qbool(0.7)` are `0.7`.

## JSON and the console

`JSON.stringify` writes the value and the threshold. Pass the parsed object back to `qbool()` to get a value that compares equal.

```js
const saved = JSON.stringify(qbool(0.7, 0.6));
// '{"value":0.7,"threshold":0.6}'
qbool(JSON.parse(saved)).equals(qbool(0.7, 0.6));  // true
```

In Node, `console.log(qbool(0.7))` prints `QBool(0.70)` instead of the property dump.

## Weighted average

`qbool.weightedAverage(items, threshold)` is the weighted mean of the certainties. A bare number weighs 1. Pass `{ value, weight }` to weigh one item differently. `QBool.weightedAverage` is the same function.

```js
qbool.weightedAverage([
  { value: 1, weight: 3 },
  { value: 0, weight: 1 }
]);
// QBool(0.75)
```

An empty list, or a list whose weights sum to 0, throws a `TypeError`.

## API

| Member | Returns |
| --- | --- |
| `qbool(value, threshold?)` | A `QBool`. A `QBool` passed with no threshold is returned as-is. |
| `new QBool(value, threshold?)` | A `QBool`. |
| `.value` | The certainty, from 0 to 1. |
| `.threshold` | The `toBoolean()` line. Default 0.5. |
| `.not()` | `1 - value`. |
| `.and(...others)` | The smallest certainty. |
| `.or(...others)` | The largest certainty. |
| `.toBoolean()` | `value >= threshold`. |
| `.equals(other)` | Same value and same threshold. |
| `.valueOf()` / `Number(q)` | The certainty. |
| `.toJSON()` | `{ value, threshold }`. |
| `qbool.weightedAverage(items, threshold?)` | The weighted mean. |

## Releasing

The package is scoped (`@mouseba11/quirky-bools`) so it can publish to both [npm](https://www.npmjs.com/) and [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry). `publishConfig` defaults to the public npm registry.

1. Update the version with `npm version patch` (or `minor` / `major`) and add an entry to [`CHANGELOG.md`](CHANGELOG.md).
2. Run `npm test` (also runs automatically via `prepublishOnly`, which then builds `dist/`).
3. Check what will be published: `npm run pack:check`.
4. Publish to npm: `npm login`, then `npm run publish:npm`.
5. Publish to GitHub Packages: authenticate to `https://npm.pkg.github.com` with a classic PAT that has `write:packages`, then `npm run publish:github`.

`dist/` is built, not edited. Change `src/index.ts` and run `npm test`.

## License

[MIT](LICENSE)
