import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import test from 'node:test';
import { QBool, qbool } from '../src/index.ts';

test('factory and constructor agree, and instanceof works', () => {
  const a = qbool(0.7);
  const b = new QBool(0.7);
  assert.ok(a instanceof QBool);
  assert.ok(b instanceof QBool);
  assert.equal(a.value, 0.7);
  assert.equal(a.threshold, 0.5);
  assert.equal(qbool(a), a);
  assert.notEqual(qbool(a, 0.8), a);
  assert.equal(qbool(a, 0.8).threshold, 0.8);
});

test('presets', () => {
  assert.equal(QBool.TRUE.value, 1);
  assert.equal(qbool.SORTA_TRUE.value, 0.75);
  assert.equal(QBool.MEH.value, 0.5);
  assert.equal(qbool.SORTA_FALSE.value, 0.25);
  assert.equal(QBool.FALSE.value, 0);
  assert.equal(qbool.TRUE, QBool.TRUE);
});

test('clamps out of range and treats NaN as empty', () => {
  assert.equal(qbool(-5).value, 0);
  assert.equal(qbool(99).value, 1);
  assert.equal(qbool(Number.NaN).value, 0);
  assert.equal(qbool(0.2, Number.NaN).threshold, 0.5);
  assert.equal(qbool('0.25').value, 0.25);
  assert.equal(new QBool(undefined).value, 0);
});

test('operations return new values and do not mutate', () => {
  const x = qbool(0.25);
  const flipped = x.not();
  assert.equal(x.value, 0.25);
  assert.equal(flipped.value, 0.75);
  assert.notEqual(flipped, x);
  assert.equal(qbool(0.2).and(0.8).value, 0.2);
  assert.equal(qbool(0.2).or(0.8).value, 0.8);
  assert.equal(qbool(0.2).and(qbool(0.9), 0.4).value, 0.2);
  assert.equal(qbool(0.2).or(0.3, 0.9).value, 0.9);
  assert.equal(qbool(0.2, 0.6).and(0.1).threshold, 0.6);
  assert.throws(() => { (x as { value: number }).value = 1; }, TypeError);
});

test('toBoolean uses the threshold', () => {
  assert.equal(qbool(0.5).toBoolean(), true);
  assert.equal(qbool(0.49).toBoolean(), false);
  assert.equal(qbool(0.4, 0.4).toBoolean(), true);
  assert.equal(+qbool(0.7), 0.7);
  assert.equal(`${qbool(0.7)}`, 'QBool(0.70)');
});

test('JSON round-trips value and threshold', () => {
  const original = qbool(0.7, 0.6);
  const parsed = qbool(JSON.parse(JSON.stringify(original)));
  assert.deepEqual(JSON.parse(JSON.stringify(original)), { value: 0.7, threshold: 0.6 });
  assert.equal(parsed.value, 0.7);
  assert.equal(parsed.threshold, 0.6);
  assert.ok(parsed.equals(original));
});

test('weightedAverage', () => {
  const even = qbool.weightedAverage([0.2, 0.8]);
  assert.equal(even.value, 0.5);
  const weighted = QBool.weightedAverage([{ value: 1, weight: 3 }, { value: 0, weight: 1 }]);
  assert.equal(weighted.value, 0.75);
  const fromBools = qbool.weightedAverage([qbool(1), qbool(0)], 0.4);
  assert.equal(fromBools.value, 0.5);
  assert.equal(fromBools.threshold, 0.4);
  assert.throws(() => qbool.weightedAverage([]), TypeError);
  assert.throws(() => qbool.weightedAverage([{ value: 1, weight: 0 }]), TypeError);
});

test('console inspection is a single QBool reading', () => {
  const text = inspect(qbool(0.7), { colors: false });
  assert.equal(text, 'QBool(0.70)');
  const colored = inspect(qbool(0.7), { colors: true });
  assert.match(colored, /QBool\(0\.70\)/);
  assert.notEqual(colored, text);
});
