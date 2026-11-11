"""CyberTrak API starter. Run with: flask --app app run"""

import logging

import mariadb
from flask import Flask, jsonify

from backend.database.connection import connect_db


def create_app():
    app = Flask(__name__)
    app.logger.setLevel(logging.INFO)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.get("/api/health/db")
    def database_health():
        connection = None
        try:
            connection = connect_db()
            cursor = connection.cursor()
            try:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            finally:
                cursor.close()
            return jsonify({"status": "ok", "database": "connected"}), 200
        except (mariadb.Error, RuntimeError, ValueError):
            # Keep credentials and server details out of the HTTP response.
            app.logger.exception("MariaDB health check failed")
            return jsonify({"status": "error", "database": "unavailable"}), 503
        finally:
            if connection is not None:
                connection.close()

    return app


app = create_app()
