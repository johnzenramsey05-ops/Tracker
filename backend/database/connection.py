"""MariaDB connection setup using credentials from the process environment."""

import os

import mariadb


def connect_db():
    """Connect to the configured MariaDB database.

    Required environment variables: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.
    DB_PORT is optional and defaults to 3306.
    """
    required = ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD")
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        raise RuntimeError("Missing database configuration: " + ", ".join(missing))

    try:
        port = int(os.getenv("DB_PORT", "3306"))
    except ValueError as error:
        raise RuntimeError("DB_PORT must be an integer") from error
    if not 1 <= port <= 65535:
        raise RuntimeError("DB_PORT must be between 1 and 65535")

    return mariadb.connect(
        host=os.environ["DB_HOST"],
        port=port,
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        connect_timeout=5,
    )
