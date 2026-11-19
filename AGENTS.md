# quirky-bools

`@mouseba11/quirky-bools` is one immutable value type, `QBool`, created with `qbool(value, threshold)`. Certainty is a number from 0 to 1. There are no runtime dependencies.

## Rules

- Do not add a runtime dependency. `tsup`, `tsx` and `typescript` are dev-only, for the build and the tests.
- Operations return a new `QBool`. Do not add a method that changes `value` or `threshold`.
- `and` is the smaller certainty and `or` is the larger. Do not switch them to a product or a sum without a version bump and a changelog note: existing callers depend on `0.7 and 0.7` staying `0.7`.
- Non-finite values become 0. A non-finite threshold stays 0.5. Keep that, and cover it in `test/qbool.test.ts`.
- `if (qbool(0))` is true, because a `QBool` is an object. Do not try to make the object itself falsy. Callers use `toBoolean()`.
- Publish `dist/` only. `src/` and `test/` stay out of the package (`files` in `package.json`).

## Commands

```
npm test            # node:test via tsx, against src/index.ts
npm run build       # tsup -> dist/index.mjs, dist/index.cjs, dist/index.d.ts
npm run pack:check  # npm pack --dry-run
```

`prepublishOnly` runs the tests and then the build.
