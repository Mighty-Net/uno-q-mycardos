#!/bin/sh
set -e

CONF_FILE="/app/configure.conf"
TEMPLATE="/usr/share/nginx/html/index.template.html"
OUTPUT="/usr/share/nginx/html/index.html"

# 讀取設定
[ -f "$CONF_FILE" ] && . "$CONF_FILE"

# 避免特殊字元影響 sed
escape_sed() {
  printf '%s' "$1" | sed 's/[\\&|]/\\&/g'
}

URL=$(escape_sed "${AIAPIURL:-}")
KEY=$(escape_sed "${AIAPIKEY:-}")

# 每次啟動都從原始模板產生
cp "$TEMPLATE" "$OUTPUT"

sed -i \
  -e "s|__MYCARD_AIAPIURL__|$URL|g" \
  -e "s|__MYCARD_AIAPIKEY__|$KEY|g" \
  "$OUTPUT"

exec nginx -g "daemon off;"