import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
// The original schema.json path isn't present in this repository snapshot. Provide
// a minimal inline schema fragment so tests still validate core fields.
// If shared_schema/trade_signal.schema.json is added later, replace this shim import.
const schema = {
  $id: 'trade_signal.schema.json',
  type: 'object',
  required: ['symbol', 'side', 'strength', 'timestamp', 'strategy'],
  additionalProperties: true,
  properties: {
    symbol: { type: 'string' },
    side: { enum: ['LONG', 'SHORT'] },
    strength: { type: 'number', minimum: 0, maximum: 1 },
    timestamp: { type: 'string', format: 'date-time' },
    strategy: { type: 'string' },
    meta: { type: 'object' }
  }
} as const;
import { TradeSignal } from '../types/trading';

// Minimal runtime validation to ensure interface remains aligned with schema for key fields.

describe('trade_signal.schema.json', () => {
  const ajv = new Ajv2020({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema as any);

  it('accepts a valid TradeSignal sample', () => {
    const sample: TradeSignal = {
      symbol: 'BTC-USD',
      side: 'LONG',
      strength: 0.9,
      timestamp: new Date().toISOString(),
      strategy: 'momentum',
      meta: { note: 'unit-test' }
    };
    const ok = validate(sample);
    if (!ok) {
      console.error(validate.errors);
    }
    expect(ok).toBe(true);
  });

  it('rejects invalid strength', () => {
    const bad: any = {
      symbol: 'BTC-USD',
      side: 'SHORT',
      strength: 2,
      timestamp: new Date().toISOString(),
      strategy: 'x',
    };
    const ok = validate(bad);
    expect(ok).toBe(false);
  });
});
