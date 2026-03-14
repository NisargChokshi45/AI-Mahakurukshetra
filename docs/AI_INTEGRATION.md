# AI Integration - Multi-Provider Intelligence Layer

**Status**: ✅ Fully Implemented
**Priority**: P0 - Critical for Demo
**Date**: March 15, 2026

---

## Overview

This document describes the production-ready AI integration system that powers intelligent insights across the Supply Chain Risk Intelligence Platform. The system supports multiple AI providers (Claude, Gemini, OpenAI, Grok) with graceful error handling, user-friendly messaging, and org-level configuration.

---

## Features Implemented

### ✅ Multi-Provider Support

The system supports **4 major AI providers**:

| Provider               | Models                               | Authentication | Status   |
| ---------------------- | ------------------------------------ | -------------- | -------- |
| **Claude** (Anthropic) | claude-3-5-sonnet-20241022 (default) | API Key        | ✅ Ready |
| **Gemini** (Google)    | gemini-2.0-flash-exp (default)       | API Key        | ✅ Ready |
| **OpenAI**             | gpt-4o (default)                     | API Key        | ✅ Ready |
| **Grok** (xAI)         | grok-2-latest (default)              | API Key        | ✅ Ready |

**Provider Fallback**: Environment variables are checked in order (Claude → Gemini → OpenAI → Grok) if no org-specific settings exist.

---

### ✅ AI-Powered Features

#### 1. Supplier Health Summaries

**Endpoint**: `POST /api/ai/supplier-summary`
**Location**: Supplier detail page (`/suppliers/[id]`)

**Input**:

- Supplier name, tier, risk score, status
- Recent risk events
- Open incidents count
- Country/region

**Output**:

- Overall risk assessment
- Key concerns
- Recommended actions (if risk score > 60)

**Example**:

```json
{
  "summary": "Aurora Electronics maintains a moderate risk profile (score: 65/100) as a Tier 1 supplier in Taiwan. Recent geopolitical tensions and 2 open incidents require immediate attention. Recommended actions: 1) Activate dual-source protocol, 2) Review inventory buffers, 3) Escalate to procurement lead.",
  "provider": "claude",
  "model": "claude-3-5-sonnet-20241022"
}
```

---

#### 2. Risk Event Analysis

**Endpoint**: `POST /api/ai/risk-event-summary`
**Location**: Risk events detail (future integration)

**Input**:

- Event type, severity, title, description
- Affected regions
- Impacted suppliers count

**Output**:

- Supply chain impact assessment
- Affected industries/sectors
- Recommended mitigation strategies
- Resolution timeline

---

#### 3. Dashboard Executive Insights

**Endpoint**: `POST /api/ai/dashboard-insights`
**Location**: Dashboard (`/dashboard`)

**Input**:

- Total suppliers, at-risk suppliers
- Active incidents count
- Recent risk events (last 5)
- Top risk suppliers (top 5)

**Output**:

- Overall risk posture (improving/stable/deteriorating)
- Key trends and patterns
- Top 2-3 recommended actions
- Emerging risks to watch

**Example**:

```json
{
  "insights": "Risk posture is DETERIORATING. 15% of your supplier base (12/78 suppliers) is now at-risk, up from 8% last week. Key drivers: 3 new geopolitical events affecting APAC region, 2 critical-priority incidents still unresolved. Priority actions: 1) Review Tier-1 exposure in Taiwan (4 suppliers), 2) Activate incident response for critical items, 3) Consider alternative sourcing for semiconductor components.",
  "provider": "gemini",
  "model": "gemini-2.0-flash-exp"
}
```

---

## Architecture

### File Structure

```
apps/web/
├── lib/ai/
│   ├── types.ts              # TypeScript types and interfaces
│   ├── providers.ts          # Multi-provider implementation (Claude, Gemini, OpenAI, Grok)
│   ├── client.ts             # Unified AI client with error handling
│   └── prompts.ts            # Structured prompt templates
├── app/api/ai/
│   ├── supplier-summary/route.ts      # Supplier health endpoint
│   ├── risk-event-summary/route.ts    # Risk event analysis endpoint
│   └── dashboard-insights/route.ts    # Dashboard insights endpoint
├── app/api/settings/ai/route.ts       # AI settings management API
├── components/ai/
│   └── ai-insight-card.tsx   # Reusable AI content card with loading/error states
├── components/settings/
│   └── ai-settings-form.tsx  # AI provider configuration form
├── components/dashboard/
│   └── ai-dashboard-insights.tsx      # Dashboard AI widget
├── components/suppliers/
│   └── ai-supplier-summary.tsx        # Supplier page AI widget
└── hooks/
    └── use-ai-insights.ts    # Reusable hook for fetching AI insights
```

### Database Schema

**Migration**: `supabase/migrations/20260315000000_013_ai_settings.sql`

```sql
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  provider TEXT CHECK (provider IN ('claude', 'gemini', 'openai', 'grok')),
  api_key TEXT NOT NULL,
  model TEXT,
  enabled BOOLEAN DEFAULT true,
  UNIQUE(organization_id, enabled) WHERE enabled = true
);
```

**RLS Policies**: Only owners and admins can read/write AI settings.

---

## Error Handling

### User-Friendly Error Messages

The system detects and displays clear, actionable error messages:

| Error Code        | User Message                                                                                                                                      | Actionable          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `INVALID_API_KEY` | "AI Configuration Required. Please configure an AI provider API key in Settings."                                                                 | ✅ Link to Settings |
| `QUOTA_EXCEEDED`  | "AI Credit Limit Reached. Your AI provider credit limit has been exceeded. Please check your billing settings or switch to a different provider." | ✅ Link to Settings |
| `RATE_LIMIT`      | "Rate Limit Exceeded. Too many AI requests. Please try again in a few moments."                                                                   | ⏱️ Retry button     |
| `PROVIDER_ERROR`  | "AI Service Unavailable. The AI service is temporarily unavailable. Please try again later."                                                      | 🔄 Retry button     |
| `NETWORK_ERROR`   | "Connection Error. Failed to connect to AI service. Please check your internet connection."                                                       | 🔄 Retry button     |

### Example Error UI

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>AI Credit Limit Reached</AlertTitle>
  <AlertDescription>
    <p>
      Your AI provider credit limit has been exceeded. Please check your billing
      settings or switch to a different provider.
    </p>
    <Button size="sm" variant="outline" asChild>
      <a href="/dashboard/settings/integrations">Configure AI Settings</a>
    </Button>
  </AlertDescription>
</Alert>
```

---

## Configuration

### Option 1: Environment Variables (Global Fallback)

Add to `.env.local`:

```bash
# At least one required
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
```

**Precedence**: Claude → Gemini → OpenAI → Grok

### Option 2: Organization Settings (Recommended)

1. Navigate to **Settings > Integrations**
2. Find **AI Provider Configuration** section
3. Select provider (Claude, Gemini, OpenAI, or Grok)
4. Enter API key
5. (Optional) Override model
6. Click **Save AI Configuration**

**Benefits**:

- Per-organization configuration
- Easy provider switching
- Secure storage in database
- UI-driven configuration (no code changes)

---

## API Reference

### `POST /api/ai/supplier-summary`

**Request**:

```json
{
  "supplierId": "uuid"
}
```

**Response (Success)**:

```json
{
  "summary": "AI-generated health summary...",
  "provider": "claude",
  "model": "claude-3-5-sonnet-20241022"
}
```

**Response (Error)**:

```json
{
  "error": "Invalid Claude API key. Please check your configuration.",
  "errorCode": "INVALID_API_KEY",
  "provider": "claude"
}
```

**Status Codes**:

- `200` - Success
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not in org)
- `404` - Supplier not found
- `503` - AI service unavailable

---

### `POST /api/ai/dashboard-insights`

**Request**: Empty body `{}`

**Response (Success)**:

```json
{
  "insights": "AI-generated insights...",
  "provider": "gemini",
  "model": "gemini-2.0-flash-exp"
}
```

---

### `POST /api/settings/ai`

**Request**:

```json
{
  "provider": "claude",
  "apiKey": "sk-ant-...",
  "model": "claude-3-5-sonnet-20241022" // optional
}
```

**Response**:

```json
{
  "success": true,
  "message": "AI settings updated successfully"
}
```

**Permissions**: Owner or Admin only

---

## Testing

### Manual Testing Steps

1. **Configure AI Provider**:
   - Go to Settings > Integrations
   - Add an API key for any provider
   - Verify success message

2. **Test Supplier Summary**:
   - Navigate to any supplier detail page
   - Wait for AI Health Summary card to load
   - Verify insights appear or graceful error is shown

3. **Test Dashboard Insights**:
   - Go to main dashboard
   - Scroll to "AI Executive Insights" card
   - Verify analysis appears

4. **Test Error Handling**:
   - Set an invalid API key in Settings
   - Reload a page with AI insights
   - Verify clear error message with "Configure AI Settings" button

5. **Test Provider Switching**:
   - Switch from Claude to Gemini in Settings
   - Reload an AI-powered page
   - Verify provider badge updates

---

## Security Considerations

✅ **Implemented**:

- API keys stored in database (encrypted at rest by Supabase)
- RLS policies restrict AI settings to owners/admins only
- API keys never exposed in API responses
- Rate limiting via existing `/api/*` middleware
- CORS protection on all AI endpoints
- Input validation with Zod schemas
- SQL injection protection via Supabase client

---

## Performance

- **Average response time**: 1-3 seconds (depends on AI provider)
- **Caching**: Not implemented (real-time insights preferred)
- **Concurrent requests**: Supported (independent API calls)
- **Loading states**: Proper UI spinners while generating

---

## Future Enhancements (Not in Scope)

- [ ] Streaming responses for longer analyses
- [ ] Chat-based "Risk Assistant" interface
- [ ] Predictive risk scoring using LLM analysis
- [ ] Alternative supplier recommendation AI
- [ ] Business impact analysis AI
- [ ] Historical trend analysis with AI commentary
- [ ] Multi-language support
- [ ] Voice-to-text risk event ingestion

---

## Migration Guide

### Applying the AI Settings Migration

```bash
# Local development
supabase db reset

# Hosted environment
supabase db push
```

### Seed Data

No seed data required. AI settings are configured per-org via UI or environment variables.

---

## Troubleshooting

### "No AI provider configured" Error

**Solution**: Add at least one API key via Settings > Integrations or set environment variable.

### "AI service unavailable" with valid key

**Possible causes**:

1. API key has expired → Check provider dashboard
2. Rate limit hit → Wait 1 minute and retry
3. Provider service outage → Check provider status page
4. Network connectivity → Check internet connection

### API key works in Postman but not in app

**Solution**: Ensure you've saved the key via the Settings UI or added to `.env.local` (and restarted Next.js dev server).

---

## Dependencies

**NPM Packages**: None (all providers use native `fetch` API)

**External Services**:

- Anthropic API (claude-3-5-sonnet)
- Google Generative AI API (gemini)
- OpenAI API (gpt-4o)
- xAI API (grok)

---

## Contact

For issues or questions about AI integration:

- Check this document first
- Review error codes and troubleshooting section
- Check the `/api/ai/*` logs in Vercel/local console

---

## Changelog

**2026-03-15** - Initial implementation

- ✅ Multi-provider support (4 providers)
- ✅ 3 AI-powered features (supplier, events, dashboard)
- ✅ User-friendly error handling
- ✅ Settings UI for configuration
- ✅ Database migration for ai_settings
- ✅ Production-ready error messages
- ✅ Documentation complete
