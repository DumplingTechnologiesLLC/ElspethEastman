FROM mcr.microsoft.com/playwright:v1.65.1-noble@sha256:1507cbfc550a63a6b7396791ca4f00df17beb56342d2447b3f106c306f525579
RUN apt-get update && apt-get install -y --no-install-recommends python3-venv \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /tmp/e2e-requirements.txt
RUN python3 -m venv /opt/e2e-python \
    && /opt/e2e-python/bin/python -m pip install --no-cache-dir -r /tmp/e2e-requirements.txt
ENV E2E_PYTHON=/opt/e2e-python/bin/python
WORKDIR /app
