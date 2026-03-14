# AI Integration - Quick Start Guide

## ⚡ 3-Minute Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Apply Database Migration

```bash
supabase db reset
# or: supabase migration up
```

### Step 3: Add API Key

**Choose the easiest method for you:**

**Option A - Environment Variable** (fastest):

```bash
# Add to .env.local
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Option B - Settings UI** (recommended):

1. Start app: `pnpm dev`
2. Go to Settings > Integrations
3. Enter API key in "AI Provider Configuration"
4. Click Save

### Step 4: Test It

1. Visit `/dashboard` → See "AI Executive Insights" card
2. Visit `/suppliers/[any-supplier]` → See "AI Health Summary"

**That's it!** 🎉

---

## 🆓 Get Free API Keys

| Provider   | Free Tier     | Link                           |
| ---------- | ------------- | ------------------------------ |
| **Claude** | $5 credit     | https://console.anthropic.com/ |
| **Gemini** | 1,500 req/day | https://ai.google.dev/         |
| **OpenAI** | $5 credit     | https://platform.openai.com/   |

---

## ❓ Troubleshooting

**"No AI provider configured"**
→ Add API key (see Step 3)

**"Service unavailable"**
→ Check API key is valid at provider's dashboard

**AI not showing up**
→ Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

---

## 📚 Full Documentation

- **Complete docs**: `docs/AI_INTEGRATION.md`
- **Implementation summary**: `docs/AI_IMPLEMENTATION_SUMMARY.md`

---

## ✨ What You Get

✅ Supplier health summaries with AI recommendations
✅ Dashboard executive insights and trend analysis
✅ Multi-provider support (Claude, Gemini, OpenAI, Grok)
✅ User-friendly error messages
✅ Settings UI for easy configuration

Ready for your hackathon demo! 🚀
