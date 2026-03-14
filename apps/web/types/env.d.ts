declare namespace NodeJS {
  interface ProcessEnv {
    ALLOWED_ORIGINS?: string;
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?: string;
    STRIPE_PRICE_ID_ENTERPRISE?: string;
    STRIPE_PRICE_ID_PROFESSIONAL?: string;
    STRIPE_PRICE_ID_STARTER?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
    UPSTASH_REDIS_REST_URL?: string;
  }
}
