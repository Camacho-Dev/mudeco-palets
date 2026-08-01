import assert from "node:assert/strict";
import { calcInvoiceTotals, resolvePaymentStatus } from "../src/lib/invoice-calc";
import { checkRateLimit } from "../src/lib/rate-limit";
import { isAdmin, canVoidInvoice } from "../src/lib/rbac";

function testTotals() {
  const t = calcInvoiceTotals([
    { quantity: 2, unitPrice: 100, taxRate: 0.18 },
    { quantity: 1, unitPrice: 50, taxRate: 0.18 },
  ]);
  assert.equal(t.subtotal, 250);
  assert.equal(t.tax, 45);
  assert.equal(t.total, 295);
}

function testPaymentStatus() {
  assert.equal(resolvePaymentStatus(100, 0, "ISSUED"), "ISSUED");
  assert.equal(resolvePaymentStatus(100, 40, "ISSUED"), "PARTIAL");
  assert.equal(resolvePaymentStatus(100, 100, "PARTIAL"), "PAID");
}

function testRbac() {
  assert.equal(isAdmin("ADMIN"), true);
  assert.equal(canVoidInvoice("VENDEDOR"), false);
  assert.equal(canVoidInvoice("ADMIN"), true);
}

function testRateLimit() {
  const key = `test-${Date.now()}`;
  assert.equal(checkRateLimit(key, 2, 60_000).ok, true);
  assert.equal(checkRateLimit(key, 2, 60_000).ok, true);
  assert.equal(checkRateLimit(key, 2, 60_000).ok, false);
}

testTotals();
testPaymentStatus();
testRbac();
testRateLimit();
console.log("OK smoke tests");
