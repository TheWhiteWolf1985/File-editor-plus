ARG BUILD_FROM

# ---------- frontend build ----------
# Fallback: avoid musl-specific Rollup optional deps resolution issues on arm64.
FROM node:20-bookworm-slim AS fe
WORKDIR /fe
COPY frontend/package*.json ./
# Workaround: on arm64, npm+package-lock can skip Rollup platform optional deps.
# Removing the lockfile and using `npm install` yields a correct `@rollup/*` native package.
RUN rm -f package-lock.json && npm install --include=optional
COPY frontend/ ./
COPY config.yaml /fe/config.yaml
RUN npm run build

# ---------- runtime ----------
FROM ${BUILD_FROM}

RUN apk add --no-cache python3 py3-pip py3-virtualenv

# crea venv
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY backend/ /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Frontend dist -> /app/frontend
COPY --from=fe /fe/dist /app/frontend
COPY docs/ /app/docs/

# s6 service
COPY rootfs/ /
