#!/bin/bash

# Quick API Test Script
# Tests all 46 endpoints for basic health

echo "🔍 Testing Laravel API Endpoints..."
echo ""

BASE_URL="http://localhost:8000/api"
ROUTES=(
    "profiles"
    "accounts"
    "categories"
    "tags"
    "transaction-tags"
    "transactions"
    "recurring-transactions"
    "budgets"
    "cost-centers"
    "cost-center-budgets"
    "goals"
    "goal-contributions"
    "scenarios"
    "debts"
    "debt-payments"
    "investments"
    "term-deposits"
    "bond-otnrs"
    "subscriptions"
    "school-fee-templates"
    "school-fees"
    "remittances"
    "split-expenses"
    "split-expense-participants"
    "split-expense-payment-histories"
    "participant-groups"
    "participant-group-members"
    "kixikilas"
    "kixikila-members"
    "kixikila-contributions"
    "insights"
    "category-prediction-logs"
    "daily-recommendations"
    "financial-scores"
    "bank-reconciliations"
    "financial-products"
    "product-requests"
    "exchange-rates"
    "exchange-rate-alerts"
    "inflation-rates"
    "uploaded-documents"
    "security-logs"
    "admin-audit-logs"
)

echo "Testing $(echo ${#ROUTES[@]}) routes..."
echo ""

SUCCESS=0
FAILED=0

for route in "${ROUTES[@]}"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$route" 2>/dev/null)
    
    # Expecting 401 (Unauthorized) or 200/204 (with auth)
    # 404 would indicate route doesn't exist
    if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "200" ]; then
        echo "✅ $route - $RESPONSE"
        ((SUCCESS++))
    else
        echo "❌ $route - $RESPONSE"
        ((FAILED++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successful: $SUCCESS"
echo "❌ Failed: $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo "🎉 All routes are responding!"
    exit 0
else
    echo "⚠️  Some routes failed. Check server logs."
    exit 1
fi
