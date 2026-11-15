FROM mcr.microsoft.com/playwright:v1.65.1-noble@sha256:1507cbfc550a63a6b7396791ca4f00df17beb56342d2447b3f106c306f525579
RUN apt-get update && apt-get install -y --no-install-recommends python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /opt/poetry \
    && /opt/poetry/bin/pip install --no-cache-dir poetry==2.5.1 \
    && python3 -m venv /opt/e2e-python
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN VIRTUAL_ENV=/opt/e2e-python POETRY_VIRTUALENVS_CREATE=false /opt/poetry/bin/poetry sync --only main
ENV E2E_PYTHON=/opt/e2e-python/bin/python
