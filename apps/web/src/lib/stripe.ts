import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// For backward compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

// Re-export from constants for server-side use
export { BADGE_PRICES, BADGE_DURATION_DAYS } from "./constants";

// TODO: Production 환경에서 Stripe 대시보드의 Price ID 사용 시 활성화
// 현재는 checkout/route.ts에서 price_data로 동적 가격 설정 중
// export const STRIPE_PRICE_IDS = {
//   SUPPORTER: process.env.STRIPE_SUPPORTER_PRICE_ID || "",
//   POLITICIAN_FAN: process.env.STRIPE_POLITICIAN_FAN_PRICE_ID || "",
// } as const;

