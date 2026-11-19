# Changelog

## [1.0.0] - 2026-11-19

First public release of `@mouseba11/quirky-bools`.

- Immutable `QBool` values in the range 0 to 1, created with `qbool(0.7)` or `new QBool(0.7)`.
- `not`, `and` and `or` return a new value. `and` takes the smaller certainty and `or` the larger.
- Presets: `TRUE`, `SORTA_TRUE`, `MEH`, `SORTA_FALSE`, `FALSE`.
- `weightedAverage`, `toBoolean`, `toJSON`, and a Node console reading of `QBool(0.70)`.
