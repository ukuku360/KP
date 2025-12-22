import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Re-export from constants for server-side use
export { BADGE_PRICES, BADGE_DURATION_DAYS } from "./constants";

// Stripe Price ID (Stripe 대시보드에서 생성 후 설정)
// 테스트 환경에서는 동적으로 가격을 설정하므로 이 ID는 사용하지 않을 수 있음
export const STRIPE_PRICE_IDS = {
  SUPPORTER: process.env.STRIPE_SUPPORTER_PRICE_ID || "",
  POLITICIAN_FAN: process.env.STRIPE_POLITICIAN_FAN_PRICE_ID || "",
} as const;

