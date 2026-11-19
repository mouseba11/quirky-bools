/**
 * A value between 0 and 1 that behaves like a boolean you can be unsure about.
 * Instances never change. Every operation returns a new QBool.
 */

const INSPECT = Symbol.for('nodejs.util.inspect.custom');

export type QBoolJson = { value: number; threshold?: number };
export type QBoolLike = QBool | number | QBoolJson;
export type WeightedItem = QBool | number | { value: number; weight?: number };

/** Finite numbers clamp into 0..1. Anything else (NaN, undefined, a bad string) becomes `ifBad`. */
export function clamp01(value: unknown, ifBad = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return ifBad;
  return Math.min(1, Math.max(0, n));
}

function read(input: QBoolLike, thresholdFallback: number): QBool {
  if (input instanceof QBool) return input;
  if (input !== null && typeof input === 'object') {
    return new QBool(input.value, input.threshold === undefined ? thresholdFallback : input.threshold);
  }
  return new QBool(input, thresholdFallback);
}

export class QBool {
  readonly value: number;
  readonly threshold: number;

  /**
   * @param value certainty, clamped to 0..1. Non-finite values become 0.
   * @param threshold the line for toBoolean(). Default 0.5. A non-finite threshold stays 0.5.
   */
  constructor(value?: unknown, threshold?: unknown) {
    this.value = clamp01(value, 0);
    this.threshold = threshold === undefined ? 0.5 : clamp01(threshold, 0.5);
    Object.freeze(this);
  }

  /** 1 - value. The threshold is kept. */
  not(): QBool {
    return new QBool(1 - this.value, this.threshold);
  }

  /** Fuzzy AND: the smaller certainty. The receiver's threshold is kept. */
  and(...others: QBoolLike[]): QBool {
    let value = this.value;
    for (const other of others) value = Math.min(value, read(other, this.threshold).value);
    return new QBool(value, this.threshold);
  }

  /** Fuzzy OR: the larger certainty. The receiver's threshold is kept. */
  or(...others: QBoolLike[]): QBool {
    let value = this.value;
    for (const other of others) value = Math.max(value, read(other, this.threshold).value);
    return new QBool(value, this.threshold);
  }

  /** True when value is at least the threshold. */
  toBoolean(): boolean {
    return this.value >= this.threshold;
  }

  /** Same value and threshold. */
  equals(other: QBoolLike): boolean {
    const that = read(other, this.threshold);
    return this.value === that.value && this.threshold === that.threshold;
  }

  valueOf(): number {
    return this.value;
  }

  toString(): string {
    return `QBool(${this.value.toFixed(2)})`;
  }

  toJSON(): { value: number; threshold: number } {
    return { value: this.value, threshold: this.threshold };
  }

  [Symbol.toPrimitive](hint: string): number | string {
    return hint === 'string' ? this.toString() : this.value;
  }

  [INSPECT](_depth: number, options?: { stylize?: (text: string, style: string) => string }): string {
    const text = this.toString();
    return options && typeof options.stylize === 'function' ? options.stylize(text, 'special') : text;
  }

  /**
   * Weighted mean of certainties. A bare number has weight 1.
   * An empty list, or weights that sum to 0, throws.
   */
  static weightedAverage(items: readonly WeightedItem[], threshold?: number): QBool {
    if (!Array.isArray(items) || items.length === 0) {
      throw new TypeError('quirky-bools: weightedAverage needs at least one value');
    }
    let sum = 0;
    let weightSum = 0;
    for (const item of items) {
      let value: number;
      let weight = 1;
      if (item instanceof QBool) {
        value = item.value;
      } else if (typeof item === 'number') {
        value = clamp01(item, 0);
      } else if (item !== null && typeof item === 'object') {
        value = clamp01(item.value, 0);
        if (item.weight !== undefined) weight = Number(item.weight);
      } else {
        throw new TypeError('quirky-bools: weightedAverage values must be numbers or QBools');
      }
      if (!Number.isFinite(weight) || weight < 0) {
        throw new TypeError('quirky-bools: weights must be finite and >= 0');
      }
      sum += value * weight;
      weightSum += weight;
    }
    if (weightSum === 0) {
      throw new TypeError('quirky-bools: weightedAverage weights must sum to more than 0');
    }
    return new QBool(sum / weightSum, threshold);
  }

  static readonly TRUE = new QBool(1);
  static readonly SORTA_TRUE = new QBool(0.75);
  static readonly MEH = new QBool(0.5);
  static readonly SORTA_FALSE = new QBool(0.25);
  static readonly FALSE = new QBool(0);
}

export interface QBoolFactory {
  (value?: QBoolLike | unknown, threshold?: unknown): QBool;
  TRUE: QBool;
  SORTA_TRUE: QBool;
  MEH: QBool;
  SORTA_FALSE: QBool;
  FALSE: QBool;
  weightedAverage: typeof QBool.weightedAverage;
}

/**
 * `qbool(0.7)` and `new QBool(0.7)` make the same kind of value.
 * Passing a QBool with no threshold returns that same instance.
 */
export const qbool = function qbool(value?: QBoolLike | unknown, threshold?: unknown): QBool {
  if (value instanceof QBool && threshold === undefined) return value;
  if (value instanceof QBool) return new QBool(value.value, threshold);
  if (value !== null && typeof value === 'object' && 'value' in (value as QBoolJson)) {
    const json = value as QBoolJson;
    return new QBool(json.value, threshold === undefined ? json.threshold : threshold);
  }
  return new QBool(value, threshold);
} as QBoolFactory;

qbool.TRUE = QBool.TRUE;
qbool.SORTA_TRUE = QBool.SORTA_TRUE;
qbool.MEH = QBool.MEH;
qbool.SORTA_FALSE = QBool.SORTA_FALSE;
qbool.FALSE = QBool.FALSE;
qbool.weightedAverage = QBool.weightedAverage;
