FROM python:3.12-slim AS base

# Setup env
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONFAULTHANDLER 1

# Maintainer Information
LABEL maintainer="Madhur Gaba <madhur4gaba@gmail.com>"

# Project Information
LABEL description="GraphHopper will be used with custom OpenStreetMap data based on edits by Madhur Gaba"


# Madhur Gaba's OSM changes: https://www.openstreetmap.org/user/Madhur%20Gaba/history#map=16/30.35418/76.36777&layers=N
# Custom area: https://www.openstreetmap.org/#map=16/30.35418/76.36777&layers=N

FROM base AS python-deps
RUN pip install pipenv
RUN apt-get update && apt-get install -y --no-install-recommends gcc

COPY Pipfile .
COPY Pipfile.lock .
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy


FROM base AS runtime
COPY --from=python-deps /.venv /.venv
ENV PATH="/.venv/bin:$PATH"
RUN useradd --create-home appuser
WORKDIR /home/appuser
USER appuser
COPY . .

EXPOSE 5000

# Run the application
ENTRYPOINT ["python", "app.py"]
