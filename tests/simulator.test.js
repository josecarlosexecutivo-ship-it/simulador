const assert = require('node:assert/strict');
const test = require('node:test');

const simulator = require('../script.js');

function near(actual, expected, precision = 0.01) {
  assert.ok(Math.abs(actual - expected) <= precision, `${actual} is not within ${precision} of ${expected}`);
}

test('parses and formats Brazilian currency values', () => {
  assert.equal(simulator.parseCurrencyToNumber('R$ 100.000,00'), 100000);
  assert.equal(simulator.parseCurrencyToNumber('1500'), 1500);
  assert.equal(simulator.normalizeCurrencyInputText('R$ 100.000,00'), 100000);
  assert.equal(simulator.normalizeCurrencyInputText('100000'), 100000);
  assert.equal(simulator.formatCurrency(1500), 'R$ 1.500,00');
  assert.equal(simulator.formatCurrency(100000), 'R$ 100.000,00');
});

test('keeps currency mask stable while typing and deleting digits', () => {
  let digits = '';
  ['1', '5', '0', '0'].forEach((digit) => {
    digits = simulator.nextMoneyDigits({
      currentDigits: digits,
      inputType: 'insertText',
      data: digit,
      replacingAll: false
    });
  });

  assert.equal(digits, '1500');
  assert.equal(simulator.formatCurrency(Number(digits)), 'R$ 1.500,00');

  digits = simulator.nextMoneyDigits({
    currentDigits: digits,
    inputType: 'deleteContentBackward',
    data: null,
    replacingAll: false
  });

  assert.equal(digits, '150');
  assert.equal(simulator.formatCurrency(Number(digits)), 'R$ 150,00');
});

test('calculates recurring wallet without adding upfront commission', () => {
  const result = simulator.calculateScenario({
    targetMonthly: 100000,
    years: 5,
    ticket: 1500,
    policy: { label: 'Individual', firstPct: 1.5, recurringPct: 0.22 }
  });

  near(result.monthlySales, 5.050505);
  near(result.totalSales, 303.030303);
  near(result.recurringAtEnd, 100000);
  near(result.monthlyUpfrontEstimate, 11363.64);
  assert.equal(result.walletIncludesUpfront, false);
});

test('splits mixed scenario target equally across the three lines', () => {
  const result = simulator.calculateMixedScenario({
    targetMonthly: 90000,
    years: 3,
    tickets: {
      individual: 1000,
      nivelado: 2000,
      empresarial: 1500
    },
    policies: {
      individual: { label: 'Individual', firstPct: 1.5, recurringPct: 0.22 },
      nivelado: { label: '20 - B', firstPct: 1, recurringPct: 0.2 },
      empresarial: { label: 'Opcao 1', firstPct: 1.25, recurringPct: 0.4 }
    }
  });

  assert.equal(result.lines.length, 3);
  result.lines.forEach((line) => near(line.targetMonthly, 30000));
  near(result.recurringAtEnd, 90000);
});

test('uses Vida em Grupo commission table for empresarial policies', () => {
  const option1 = simulator.EMPRESARIAL_POLICIES.find((item) => item.code === '1');
  const option8 = simulator.EMPRESARIAL_POLICIES.find((item) => item.code === '8');

  assert.deepEqual(
    { firstPct: option1.firstPct, recurringPct: option1.recurringPct, factor: option1.factor },
    { firstPct: 1.25, recurringPct: 0.4, factor: 1 }
  );
  assert.deepEqual(
    { firstPct: option8.firstPct, recurringPct: option8.recurringPct, factor: option8.factor },
    { firstPct: 0.4, recurringPct: 0.4, factor: 0.85 }
  );
});
