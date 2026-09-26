from PIL import (
    Image,
    UnidentifiedImageError
)

import os


# =========================================================
# CONFIGURACIÓN
# =========================================================

MAX_FILE_SIZE = 10 * 1024 * 1024
# 10 MB


MAX_IMAGE_PIXELS = 25_000_000
# Protección contra imágenes con dimensiones excesivas


ALLOWED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
}


# =========================================================
# PROTECCIÓN DE PILLOW
# =========================================================

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


# =========================================================
# CONVERTIR STICKER
# =========================================================

def convert_sticker(
    file,
    output_path
):
    """
    Convierte una imagen compatible a WebP.

    Parámetros:
        file:
            Archivo recibido desde Flask.

        output_path:
            Ruta donde se guardará el WebP.

    Retorna:
        output_path

    Lanza:
        ValueError si el archivo no es válido.
    """

    # =====================================================
    # VERIFICAR NOMBRE
    # =====================================================

    if not file.filename:

        raise ValueError(
            "El sticker no tiene un nombre válido."
        )


    original_name = file.filename


    # =====================================================
    # VERIFICAR TAMAÑO DEL ARCHIVO
    # =====================================================

    file.seek(
        0,
        os.SEEK_END
    )

    file_size = file.tell()

    file.seek(0)


    if file_size > MAX_FILE_SIZE:

        raise ValueError(
            f'El archivo "{original_name}" '
            "supera el límite de 10 MB."
        )


    # =====================================================
    # VERIFICAR EXTENSIÓN
    # =====================================================

    extension = os.path.splitext(
        original_name
    )[1].lower()


    if extension not in ALLOWED_EXTENSIONS:

        raise ValueError(
            f'El archivo "{original_name}" '
            "no es compatible. "
            "Usa PNG, JPG, WEBP o GIF."
        )


    # =====================================================
    # ABRIR Y VALIDAR IMAGEN
    # =====================================================

    try:

        image = Image.open(
            file
        )


        # ---------------------------------------------
        # VERIFICAR QUE EL ARCHIVO SEA UNA IMAGEN REAL
        # ---------------------------------------------

        image.verify()


        # ---------------------------------------------
        # VOLVER AL PRINCIPIO DEL ARCHIVO
        # ---------------------------------------------

        file.seek(0)


        # ---------------------------------------------
        # ABRIR NUEVAMENTE PARA PROCESAR
        # ---------------------------------------------

        image = Image.open(
            file
        )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError
    ):

        raise ValueError(
            f'El archivo "{original_name}" '
            "no es una imagen válida "
            "o tiene dimensiones excesivas."
        )


    # =====================================================
    # CONVERTIR A RGBA
    # =====================================================

    try:

        image = image.convert(
            "RGBA"
        )

    except Exception:

        raise ValueError(
            f'No se pudo procesar el archivo '
            f'"{original_name}".'
        )


    # =====================================================
    # REDIMENSIONAR
    # =====================================================

    image.thumbnail(

        (512, 512),

        Image.Resampling.LANCZOS

    )


    # =====================================================
    # CREAR CARPETA DE DESTINO
    # =====================================================

    output_directory = os.path.dirname(
        output_path
    )


    if output_directory:

        os.makedirs(

            output_directory,

            exist_ok=True

        )


    # =====================================================
    # GUARDAR COMO WEBP
    # =====================================================

    try:

        image.save(

            output_path,

            "WEBP",

            quality=90,

            method=6

        )

    except Exception:

        raise ValueError(
            f'No se pudo guardar el sticker '
            f'"{original_name}" como WebP.'
        )


    # =====================================================
    # CERRAR IMAGEN
    # =====================================================

    try:

        image.close()

    except Exception:

        pass


    # =====================================================
    # RETORNAR RESULTADO
    # =====================================================

    return output_path
