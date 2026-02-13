ARG BUILD_FROM

# ---------- frontend build ----------
FROM node:20-alpine AS fe
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm ci
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

# s6 service
COPY rootfs/ /
