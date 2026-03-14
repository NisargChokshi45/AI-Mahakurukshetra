#!/bin/bash
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY is not set"
  exit 1
fi

echo "Fetching OpenAI usage..."

START=$(date -d "2 days ago" +%s)
END=$(date +%s)

echo ""
echo "Costs (last 2 days)"
curl -s "https://api.openai.com/v1/organization/costs?start_time=$START&end_time=$END" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq

echo ""
echo "Token usage"
curl -s "https://api.openai.com/v1/organization/usage/completions?start_time=$START&end_time=$END" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq
