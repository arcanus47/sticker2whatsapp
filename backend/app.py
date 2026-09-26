from flask import Flask, jsonify
from flask_cors import CORS
import os

from routes.convert import convert_bp


# =========================================================
# CREAR APLICACIÓN
# =========================================================

app = Flask(__name__)


# =========================================================
# CONFIGURACIÓN
# =========================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5500"
)


UPLOAD_FOLDER = os.getenv(
    "UPLOAD_FOLDER",
    "/app/temp"
)


# =========================================================
# LÍMITE DE PETICIONES
# =========================================================

app.config["MAX_CONTENT_LENGTH"] = (
    10 * 1024 * 1024 + 1024 * 1024
)


# =========================================================
# CONFIGURAR CORS
# =========================================================

if FRONTEND_URL == "*":

    CORS(app)

else:

    CORS(
        app,
        origins=[
            FRONTEND_URL
        ]
    )


# =========================================================
# CREAR CARPETA TEMPORAL
# =========================================================

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# RUTA PRINCIPAL
# =========================================================

@app.route("/")
def home():

    return jsonify({

        "message":
            "Sticker2WhatsApp API funcionando",

        "status":
            "ok"

    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health")
def health():

    return jsonify({

        "status":
            "healthy"

    })


# =========================================================
# REGISTRAR RUTAS
# =========================================================

app.register_blueprint(
    convert_bp
)


# =========================================================
# EJECUCIÓN LOCAL
# =========================================================

if __name__ == "__main__":

    port = int(
        os.getenv(
            "PORT",
            "5000"
        )
    )


    app.run(

        host="0.0.0.0",

        port=port,

        debug=False

    )
