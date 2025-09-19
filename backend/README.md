# F1-WebApp
# F1 API – README

## Overview

This folder contains the backend API for the F1 project, developed for the COM5041 Web Programming assignment, F1-WebApp project. The API is built with **Node.js**, **Express**, and **Supabase**. It exposes a versioned set of endpoints under `/v1` to provide read-only access to Formula 1 data such as races, drivers, and teams.

The API demonstrates the implementation of a database-powered web service with authentication, filtering, pagination, and error handling.

---

## Features

* **Health check** endpoint
* **Races API** – filter by season/year and race type
* **Drivers API** – filter by id, number, team, or search by name
* **Teams API** – list or filter by team id/name
* Pagination (`limit`, `offset`) and sorting support
* Uniform error responses in JSON
* Versioned under `/v1` for maintainability


## Requirements

* Node.js 18+
* NPM
* Supabase project with tables: `races`, `drivers`, `teams`
* SQL views: `api_v1_races`, `api_v1_drivers`, `api_v1_teams`

## Installation

1. Clone the repository:

2. Install dependencies:

   npm install
   

3. Create `.env` in the `backend/` folder:

   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-anon-key>
   PORT=8787

4. Start the server:

   npm start

## Endpoints

### Health

* `GET /health` → `{ "ok": true }`

### Races

* `GET /v1/races`
* Query params: `season`, `year`, `race_type`, `limit`, `offset`
* Example:

* GET http://localhost:8787/v1/races?season=2025&limit=5

### Drivers

* `GET /v1/drivers`
* Query params: `driver_id`, `driver_number`, `team_id`, `q`, `limit`, `offset`
* Example:

  GET http://localhost:8787/v1/drivers?q=hamilton&limit=5
  
### Teams

* `GET /v1/teams`
* Query params: `team_id`, `name`, `limit`, `offset`
* Example:

  GET http://localhost:8787/v1/teams?name=ferrari

### Authentication

* `POST /auth/signup`
* Body:
* { "email": "user@example.com", 
* "password": "example" }
* Notes: If email confirmation is enabled, user must confirm before login.

* `POST /auth/login`
* Body:
* { "email": "user@example.com", 
* "password": "example" }

* `POST /auth/logout`
* Body:
* { "email": "user@example.com", 
* "password": "example" }

### User favourites

* `POST /v1/favourites/drivers`
* Body:
* { "driver_id": 7, "season": 2025 }

* `POST /v1/favourites/teams`
* Body:
* { "team_id": 4, "season": 2025 }

## Error Handling

All errors return JSON in a standard format:
{
  "error": {
    "code": 400,
    "message": "Invalid query",
    "detail": "season must be an integer"
  }
}

## Security

* Public endpoints query **views** (`api_v1_*`) with the **anon key**.
* Base tables are protected by RLS (Row-Level Security).
* No service-role keys are exposed in the API.

## Versioning

* All endpoints are under `/v1/...`.
* Future changes will use `/v2/...`.
