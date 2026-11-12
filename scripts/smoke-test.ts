import assert from "node:assert/strict";
import {
  calcInvoiceTotals,
  creditNotesAmount,
  paidAmount,
  resolvePaymentStatus,
  resolveInvoiceStatusWithCredits,
} from "../src/lib/invoice-calc";
import { formatCurrency, roundMoney } from "../src/lib/format";
import { checkRateLimit } from "../src/lib/rate-limit";
import { isAdmin, isStaff, canVoidInvoice, homeForRole } from "../src/lib/rbac";

function testTotals() {
  const t = calcInvoiceTotals([
    { quantity: 2, unitPrice: 100, taxRate: 0.18 },
    { quantity: 1, unitPrice: 50, taxRate: 0.18 },
  ]);
  assert.equal(t.subtotal, 250);
  assert.equal(t.tax, 45);
  assert.equal(t.total, 295);

  const exempt = calcInvoiceTotals(
    [{ quantity: 2, unitPrice: 100, taxRate: 0.18 }],
    { applyTax: false, deliveryFee: 500 },
  );
  assert.equal(exempt.subtotal, 200);
  assert.equal(exempt.tax, 0);
  assert.equal(exempt.total, 700);
}

function testMoneyHelpers() {
  assert.equal(roundMoney(10.005), 10.01);
  assert.equal(roundMoney(10.004), 10);
  assert.ok(formatCurrency(1250.5).includes("1,250.50"));
  assert.equal(paidAmount([{ amount: 100.12 }, { amount: 49.88 }]), 150);
  assert.equal(creditNotesAmount([{ total: 75.5 }, { total: 24.5 }]), 100);
}

function testPaymentStatus() {
  assert.equal(resolvePaymentStatus(100, 0, "ISSUED"), "ISSUED");
  assert.equal(resolvePaymentStatus(100, 40, "ISSUED"), "PARTIAL");
  assert.equal(resolvePaymentStatus(100, 100, "PARTIAL"), "PAID");
  assert.equal(resolveInvoiceStatusWithCredits(100, 50, 50, "PARTIAL"), "PAID");
  assert.equal(resolveInvoiceStatusWithCredits(100, 0, 100, "ISSUED"), "PAID");
  assert.equal(resolveInvoiceStatusWithCredits(100, 0, 25, "ISSUED"), "PARTIAL");
  assert.equal(resolveInvoiceStatusWithCredits(100, 0, 100, "VOIDED"), "VOIDED");
  assert.equal(resolveInvoiceStatusWithCredits(100, 0, 100, "DRAFT"), "DRAFT");
}

function testRbac() {
  assert.equal(isAdmin("ADMIN"), true);
  assert.equal(isAdmin("VENDEDOR"), false);
  assert.equal(isAdmin("CLIENTE"), false);
  assert.equal(isStaff("ADMIN"), true);
  assert.equal(isStaff("VENDEDOR"), true);
  assert.equal(isStaff("CLIENTE"), false);
  assert.equal(canVoidInvoice("VENDEDOR"), false);
  assert.equal(canVoidInvoice("ADMIN"), true);
  assert.equal(homeForRole("ADMIN"), "/panel");
  assert.equal(homeForRole("VENDEDOR"), "/vender");
  assert.equal(homeForRole("CLIENTE"), "/");
}

function testRateLimit() {
  const ts = Date.now();
  const keyA = `test-a-${ts}`;
  const keyB = `test-b-${ts}`;
  assert.equal(checkRateLimit(keyA, 2, 60_000).ok, true);
  assert.equal(checkRateLimit(keyA, 2, 60_000).ok, true);
  assert.equal(checkRateLimit(keyA, 2, 60_000).ok, false);
  assert.equal(checkRateLimit(keyB, 2, 60_000).ok, true);
}

testTotals();
testMoneyHelpers();
testPaymentStatus();
testRbac();
testRateLimit();
console.log("OK smoke tests");
