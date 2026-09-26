from flask import (
    Blueprint,
    request,
    send_file,
    jsonify,
    after_this_request
)

import os
import uuid
import shutil
import zipfile

from services.sticker_converter import convert_sticker


# =========================================================
# BLUEPRINT
# =========================================================

convert_bp = Blueprint(
    "convert",
    __name__
)


# =========================================================
# CONFIGURACIÓN
# =========================================================

UPLOAD_FOLDER = os.getenv(
    "UPLOAD_FOLDER",
    "/app/temp"
)

MAX_FILES = 50


# =========================================================
# LIMPIAR CARPETA TEMPORAL
# =========================================================

def cleanup_folder(
    folder
):

    try:

        if os.path.exists(
            folder
        ):

            shutil.rmtree(
                folder,
                ignore_errors=True
            )

    except Exception as error:

        print(
            "Error limpiando archivos temporales:",
            str(error)
        )


# =========================================================
# CONVERTIR STICKERS
# =========================================================

@convert_bp.route(
    "/api/convert",
    methods=["POST"]
)
def convert_stickers():

    # =====================================================
    # OBTENER ARCHIVOS
    # =====================================================

    files = request.files.getlist(
        "stickers"
    )


    # =====================================================
    # VERIFICAR ARCHIVOS
    # =====================================================

    if not files:

        return jsonify({

            "error":
                "No se recibió ningún sticker."

        }), 400


    # =====================================================
    # VERIFICAR CANTIDAD
    # =====================================================

    if len(files) > MAX_FILES:

        return jsonify({

            "error":
                f"Puedes convertir un máximo de "
                f"{MAX_FILES} stickers."

        }), 400


    # =====================================================
    # CREAR CARPETA TEMPORAL
    # =====================================================

    conversion_id = str(
        uuid.uuid4()
    )


    conversion_folder = os.path.join(

        UPLOAD_FOLDER,

        conversion_id

    )


    os.makedirs(

        conversion_folder,

        exist_ok=True

    )


    converted_files = []


    try:

        # =================================================
        # PROCESAR ARCHIVOS
        # =================================================

        for index, file in enumerate(
            files,
            start=1
        ):

            if not file.filename:

                raise ValueError(

                    f"El sticker #{index} "
                    "no tiene un nombre válido."

                )


            # ---------------------------------------------
            # NOMBRE DE SALIDA
            # ---------------------------------------------

            output_filename = (
                f"sticker-{index:02d}.webp"
            )


            output_path = os.path.join(

                conversion_folder,

                output_filename

            )


            # ---------------------------------------------
            # CONVERTIR
            # ---------------------------------------------

            convert_sticker(

                file,

                output_path

            )


            # ---------------------------------------------
            # REGISTRAR
            # ---------------------------------------------

            converted_files.append({

                "filename":
                    output_filename,

                "path":
                    output_path

            })


        # =================================================
        # UN SOLO STICKER
        # =================================================

        if len(converted_files) == 1:

            file_path = (
                converted_files[0]["path"]
            )


            response = send_file(

                file_path,

                mimetype="image/webp",

                as_attachment=True,

                download_name="sticker.webp"

            )


            @after_this_request
            def cleanup_after_response(
                response
            ):

                cleanup_folder(
                    conversion_folder
                )

                return response


            return response


        # =================================================
        # VARIOS STICKERS
        # =================================================

        zip_filename = (
            "stickers-whatsapp.zip"
        )


        zip_path = os.path.join(

            conversion_folder,

            zip_filename

        )


        with zipfile.ZipFile(

            zip_path,

            "w",

            compression=zipfile.ZIP_DEFLATED

        ) as zip_file:

            for converted_file in converted_files:

                zip_file.write(

                    converted_file["path"],

                    arcname=
                        converted_file["filename"]

                )


        # =================================================
        # DEVOLVER ZIP
        # =================================================

        response = send_file(

            zip_path,

            mimetype="application/zip",

            as_attachment=True,

            download_name=
                "stickers-whatsapp.zip"

        )


        @after_this_request
        def cleanup_after_response(
            response
        ):

            cleanup_folder(
                conversion_folder
            )

            return response


        return response


    # =====================================================
    # ERROR CONTROLADO
    # =====================================================

    except ValueError as error:

        cleanup_folder(
            conversion_folder
        )


        return jsonify({

            "error":
                str(error)

        }), 400


    # =====================================================
    # ERROR GENERAL
    # =====================================================

    except Exception as error:

        print(
            "Error durante la conversión:",
            str(error)
        )


        cleanup_folder(
            conversion_folder
        )


        return jsonify({

            "error":
                "Ocurrió un error al convertir "
                "los stickers."

        }), 500
