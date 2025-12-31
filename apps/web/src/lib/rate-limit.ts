import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Upstash Redis 환경 변수 확인
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Rate limiter 인스턴스 (환경 변수가 있을 때만 생성)
let ratelimit: Ratelimit | null = null;

if (upstashUrl && upstashToken) {
  const redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"), // 분당 10회
    analytics: true,
  });
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiting 체크
 * @param identifier - 사용자 식별자 (userId 또는 IP)
 * @param prefix - 엔드포인트별 구분자 (예: "posts", "comments")
 * @returns RateLimitResult 또는 null (Rate Limiting 비활성화 시)
 */
export async function checkRateLimit(
  identifier: string,
  prefix: string = "api"
): Promise<RateLimitResult | null> {
  if (!ratelimit) {
    // Rate limiting이 설정되지 않은 경우 통과
    return null;
  }

  const key = `${prefix}:${identifier}`;
  const result = await ratelimit.limit(key);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Rate limit 초과 시 응답 생성
 */
export function rateLimitExceededResponse(result: RateLimitResult) {
  return NextResponse.json(
    { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      },
    }
  );
}

/**
 * Rate limiting이 활성화되어 있는지 확인
 */
export function isRateLimitEnabled(): boolean {
  return ratelimit !== null;
}
