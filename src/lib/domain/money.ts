export function sponsorshipTotal(unitPrice: number | null | undefined, quantity: number | null | undefined) {
  const price = Number(unitPrice ?? 0);
  const qty = quantity == null ? 1 : Number(quantity);
  return Math.round(price * qty * 100) / 100;
}
