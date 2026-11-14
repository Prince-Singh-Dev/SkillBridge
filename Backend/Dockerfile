FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
    LANG=en_US.UTF-8

RUN groupadd -r pptruser \
    && useradd -u 10042 -rm -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/app \
    && chown -R pptruser:pptruser /home/pptruser

WORKDIR /home/pptruser/app

COPY --chown=pptruser:pptruser package*.json ./

USER pptruser
RUN npm ci --omit=dev

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        fonts-liberation \
        dbus \
        dbus-x11 \
        tini \
    && npx puppeteer browsers install chrome --install-deps \
    && chown -R pptruser:pptruser /home/pptruser/.cache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER pptruser
COPY --chown=pptruser:pptruser . .

EXPOSE 3000
ENTRYPOINT [ "/usr/bin/tini", "--" ]
CMD [ "node", "server.js" ]
