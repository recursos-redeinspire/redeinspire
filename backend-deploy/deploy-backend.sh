#!/bin/bash
# =============================================================================
# Deploy Backend — Rede Inspire
# Creates: DynamoDB tables, Lambda function, API Gateway HTTP API
# =============================================================================
set -e

REGION="us-east-1"
ACCOUNT_ID="375210271564"
FUNCTION_NAME="rede-inspire-api"
API_NAME="rede-inspire-api"
ROLE_NAME="rede-inspire-lambda-role"

echo "🚀 Deploying Rede Inspire Backend..."

# ============================================
# 1. Create IAM Role for Lambda
# ============================================
echo ""
echo "📋 Step 1: Creating IAM Role..."

TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || true)

if [ -z "$ROLE_ARN" ] || [ "$ROLE_ARN" = "None" ]; then
  ROLE_ARN=$(aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document "$TRUST_POLICY" \
    --query 'Role.Arn' --output text)
  echo "  ✓ Role created: $ROLE_ARN"
  
  # Attach policies
  aws iam attach-role-policy --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  aws iam attach-role-policy --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
  
  echo "  ✓ Policies attached"
  echo "  ⏳ Waiting 10s for role propagation..."
  sleep 10
else
  echo "  ✓ Role exists: $ROLE_ARN"
fi

# ============================================
# 2. Create DynamoDB Tables
# ============================================
echo ""
echo "📋 Step 2: Creating DynamoDB Tables..."

TABLES=(
  "RedeInspire-Users"
  "RedeInspire-Content"
  "RedeInspire-Trails"
  "RedeInspire-TrailProgress"
  "RedeInspire-Messages"
  "RedeInspire-Churches"
  "RedeInspire-Plans"
  "RedeInspire-Mentoring"
  "RedeInspire-Podcast"
  "RedeInspire-PodcastProgress"
  "RedeInspire-Webinars"
  "RedeInspire-Timeline"
  "RedeInspire-Ministries"
)

for TABLE in "${TABLES[@]}"; do
  EXISTS=$(aws dynamodb describe-table --table-name "$TABLE" --region $REGION 2>/dev/null && echo "yes" || echo "no")
  if [ "$EXISTS" = "no" ]; then
    aws dynamodb create-table \
      --table-name "$TABLE" \
      --attribute-definitions AttributeName=id,AttributeType=S \
      --key-schema AttributeName=id,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --region $REGION > /dev/null
    echo "  ✓ Created: $TABLE"
  else
    echo "  ✓ Exists: $TABLE"
  fi
done

echo "  ⏳ Waiting for tables to be active..."
for TABLE in "${TABLES[@]}"; do
  aws dynamodb wait table-exists --table-name "$TABLE" --region $REGION 2>/dev/null || true
done
echo "  ✓ All tables active"

# ============================================
# 3. Package Lambda
# ============================================
echo ""
echo "📦 Step 3: Packaging Lambda..."

cd "$(dirname "$0")"
npm install --production --silent 2>/dev/null
zip -r -q lambda.zip index.mjs node_modules/
echo "  ✓ Package created ($(du -h lambda.zip | cut -f1))"

# ============================================
# 4. Create/Update Lambda Function
# ============================================
echo ""
echo "⚡ Step 4: Deploying Lambda..."

LAMBDA_EXISTS=$(aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null && echo "yes" || echo "no")

if [ "$LAMBDA_EXISTS" = "no" ]; then
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs20.x \
    --handler index.handler \
    --role "$ROLE_ARN" \
    --zip-file fileb://lambda.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment "Variables={JWT_SECRET=rede-inspire-secret-2026}" \
    --region $REGION > /dev/null
  echo "  ✓ Lambda created"
else
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://lambda.zip \
    --region $REGION > /dev/null
  echo "  ✓ Lambda updated"
  sleep 3
  aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --timeout 30 \
    --memory-size 256 \
    --environment "Variables={JWT_SECRET=rede-inspire-secret-2026}" \
    --region $REGION > /dev/null 2>/dev/null || true
fi

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

# ============================================
# 5. Create API Gateway HTTP API
# ============================================
echo ""
echo "🌐 Step 5: Setting up API Gateway..."

API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text 2>/dev/null)

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
  API_ID=$(aws apigatewayv2 create-api \
    --name "$API_NAME" \
    --protocol-type HTTP \
    --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PUT,DELETE,OPTIONS,AllowHeaders=Content-Type,Authorization" \
    --region $REGION \
    --query 'ApiId' --output text)
  echo "  ✓ API created: $API_ID"
else
  echo "  ✓ API exists: $API_ID"
  # Update CORS
  aws apigatewayv2 update-api \
    --api-id "$API_ID" \
    --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PUT,DELETE,OPTIONS,AllowHeaders=Content-Type,Authorization" \
    --region $REGION > /dev/null 2>/dev/null || true
fi

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id "$API_ID" --region $REGION --query 'Items[0].IntegrationId' --output text 2>/dev/null)

if [ -z "$INTEGRATION_ID" ] || [ "$INTEGRATION_ID" = "None" ]; then
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "$LAMBDA_ARN" \
    --payload-format-version "2.0" \
    --region $REGION \
    --query 'IntegrationId' --output text)
  echo "  ✓ Integration created"
else
  echo "  ✓ Integration exists"
fi

# Create catch-all route
ROUTE_EXISTS=$(aws apigatewayv2 get-routes --api-id "$API_ID" --region $REGION --query "Items[?RouteKey=='\$default'].RouteId" --output text 2>/dev/null)

if [ -z "$ROUTE_EXISTS" ] || [ "$ROUTE_EXISTS" = "None" ]; then
  aws apigatewayv2 create-route \
    --api-id "$API_ID" \
    --route-key '$default' \
    --target "integrations/$INTEGRATION_ID" \
    --region $REGION > /dev/null
  echo "  ✓ Default route created"
else
  echo "  ✓ Route exists"
fi

# Create/update stage
STAGE_EXISTS=$(aws apigatewayv2 get-stages --api-id "$API_ID" --region $REGION --query "Items[?StageName=='\$default'].StageName" --output text 2>/dev/null)

if [ -z "$STAGE_EXISTS" ] || [ "$STAGE_EXISTS" = "None" ]; then
  aws apigatewayv2 create-stage \
    --api-id "$API_ID" \
    --stage-name '$default' \
    --auto-deploy \
    --region $REGION > /dev/null
  echo "  ✓ Stage created"
else
  echo "  ✓ Stage exists"
fi

# Add Lambda permission for API Gateway
aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id "apigateway-invoke-$(date +%s)" \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
  --region $REGION > /dev/null 2>/dev/null || true

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com"

echo ""
echo "============================================"
echo "✅ Backend deployed successfully!"
echo "============================================"
echo "🌐 API URL: $API_URL"
echo "⚡ Lambda: $FUNCTION_NAME"
echo "📊 Tables: ${#TABLES[@]} DynamoDB tables"
echo ""
echo "Next steps:"
echo "  1. Run seed: node seed.mjs"
echo "  2. Test: curl $API_URL/health"
echo "  3. Update frontend VITE_API_BASE_URL"
echo ""

# Save API URL for later use
echo "$API_URL" > api-url.txt
