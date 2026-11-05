# CyberTrak Python backend

This is a separate Python API for the HTML frontend. The root `app.py` is a
class exercise and is not connected to the CyberTrak MariaDB database.

## Setup

From the project root, create a virtual environment, install the dependencies,
and set the database environment variables shown in `.env.example`. Keep the
real database password out of source control.

On Linux/Turing, from this directory:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
export DB_HOST='your_turing_mariadb_host'
export DB_PORT='3306'
export DB_NAME='your_database_name'
export DB_USER='your_database_username'
read -rsp 'MariaDB password: ' DB_PASSWORD
printf '\n'
export DB_PASSWORD
flask --app backend.app run --host 127.0.0.1 --port 5000
```

The API starts with:

- `GET /api/health` - confirms the Flask API is running.
- `GET /api/health/db` - checks the MariaDB connection using `SELECT 1`.

The database health endpoint returns a generic error to clients if the
connection fails; credential and server details stay in the server log.

This development server is for local development only. Do not expose it to the
public internet as a production server.
