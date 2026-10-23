#!/bin/bash
# Deploy script - Plataforma Rede Inspire
# Uso: ./deploy.sh

BUCKET="rede-inspire-platform-danilo"
DISTRIBUTION_ID="E1JVLCNJ8N0DDH"
PROFILE="danilo"

echo "🔨 Fazendo build de produção..."
cd frontend && npm run build && cd ..

echo "📤 Fazendo upload para S3..."
aws s3 sync frontend/dist/ "s3://$BUCKET/" --delete --profile "$PROFILE"

echo "🔄 Invalidando cache do CloudFront..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --profile "$PROFILE"

echo "✅ Deploy concluído!"
echo "🌐 URL: https://d38f9wnqgvzwjc.cloudfront.net"
