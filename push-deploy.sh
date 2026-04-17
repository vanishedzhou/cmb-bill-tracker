#!/bin/bash
# One-click deploy from Mac to remote server.
# Usage: ./push-deploy.sh
#
# Requires DEPLOY_SERVER and DEPLOY_DIR in .env, e.g.:
#   DEPLOY_SERVER=ubuntu@1.2.3.4
#   DEPLOY_DIR=/home/ubuntu/projects/cmb-bill-tracker
#   DEPLOY_URL=https://example.com/cmb/

set -e
cd "$(dirname "$0")"

# Load .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^\s*$' | xargs)
fi

if [ -z "$DEPLOY_SERVER" ] || [ -z "$DEPLOY_DIR" ]; then
    echo "❌ Please set DEPLOY_SERVER and DEPLOY_DIR in .env"
    echo "   Example:"
    echo "     DEPLOY_SERVER=ubuntu@1.2.3.4"
    echo "     DEPLOY_DIR=/home/ubuntu/projects/cmb-bill-tracker"
    exit 1
fi

echo "📦 Syncing files to ${DEPLOY_SERVER}:${DEPLOY_DIR}..."
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.claude' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude 'node_modules' \
  --exclude '*.db' \
  --exclude '*.tar.gz' \
  --exclude 'server.log' \
  --exclude 'data/' \
  --exclude '.env' \
  ./ "${DEPLOY_SERVER}:${DEPLOY_DIR}/"

echo ""
echo "🔄 Restarting service on server..."
ssh "$DEPLOY_SERVER" "cd ${DEPLOY_DIR} && bash restart.sh"

echo ""
if [ -n "$DEPLOY_URL" ]; then
    echo "✅ Deploy complete! Visit: ${DEPLOY_URL}"
else
    echo "✅ Deploy complete!"
fi
