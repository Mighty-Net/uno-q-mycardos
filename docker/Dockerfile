# Stage 1: Build React
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

COPY . .

# 建立 .env 並寫入 Runtime 佔位值
RUN cp .env.example .env \
    && sed -i \
      -e 's|^VITE_AIAPIURL=.*|VITE_AIAPIURL=__MYCARD_AIAPIURL__|' \
      -e 's|^VITE_AIAPIKEY=.*|VITE_AIAPIKEY=__MYCARD_AIAPIKEY__|' \
      .env

RUN npm run build


# Stage 2: Production
FROM nginx:alpine

COPY --from=builder /app/dist/ /usr/share/nginx/html/

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/docker-entrypoint.sh /usr/local/bin/mycard-entrypoint.sh

# SSL Certificate
COPY docker/certs/ /etc/nginx/certs/

RUN chmod +x /usr/local/bin/mycard-entrypoint.sh \
    && cp /usr/share/nginx/html/index.html \
          /usr/share/nginx/html/index.template.html

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/mycard-entrypoint.sh"]