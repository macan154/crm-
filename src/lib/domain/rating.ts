export type RatingStats = {
  written: number;
  partners: number;
  giftSum: number;
  events: number;
};

export type RatingCoeffs = {
  written: number;
  partners: number;
  sum: number;
  events: number;
};

export function memberScore(stats: RatingStats, coeffs: RatingCoeffs) {
  return (
    stats.written * coeffs.written +
    stats.partners * coeffs.partners +
    stats.giftSum * coeffs.sum +
    stats.events * coeffs.events
  );
}
