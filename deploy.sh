#!/bin/bash
# Deploy script - Plataforma Rede Inspire
# Uso: ./deploy.sh

BUCKET="rede-inspire-platform-1772850946"
DISTRIBUTION_ID="E2PZJMLFDML7H5"

echo "🔨 Fazendo build de produção..."
cd frontend && npm run build && cd ..

echo "📤 Fazendo upload para S3..."
aws s3 sync frontend/dist/ "s3://$BUCKET/" --delete

echo "🔄 Invalidando cache do CloudFront..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

echo "✅ Deploy concluído!"
echo "🌐 URL: https://d31fdj58pr44ac.cloudfront.net"
