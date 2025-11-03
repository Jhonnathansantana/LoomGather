# Instrucciones para la Configuración Inicial de la Base de Datos en Supabase

Este documento contiene los pasos para ejecutar el script de migración SQL y configurar el esquema inicial de la base de datos para el proyecto LoomGather.

## Requisitos

- Tener un proyecto creado en [Supabase](https://supabase.com/).
- Tener acceso como administrador al dashboard del proyecto.

## Pasos para ejecutar la migración

El archivo `00_initial_schema.sql` contiene todo el código necesario para crear las tablas, configurar la seguridad y poblar el cuestionario inicial.

Sigue estos pasos para ejecutarlo:

1.  **Abrir el Editor SQL:**
    *   Inicia sesión en tu cuenta de Supabase.
    *   Navega al proyecto "LoomGather".
    *   En el menú de la izquierda, haz clic en el icono de la base de datos para ir a la sección **Database**.
    *   Luego, selecciona **SQL Editor** en la lista.

2.  **Crear una nueva consulta:**
    *   Haz clic en el botón **+ New query**.

3.  **Copiar el contenido del script:**
    *   Abre el archivo `00_initial_schema.sql` que se encuentra en este mismo directorio.
    *   Selecciona y copia **todo** el contenido del archivo.

4.  **Pegar y ejecutar el script:**
    *   Pega el contenido copiado en la ventana del editor de consultas de Supabase.
    *   Haz clic en el botón verde **RUN** para ejecutar el script.

5.  **Verificar la creación:**
    *   Una vez que el script se haya ejecutado (deberías ver un mensaje de "Success"), puedes verificar que todo se creó correctamente.
    *   Ve al **Table Editor** (el icono de tabla en el menú de la izquierda).
    *   Deberías ver las nuevas tablas: `profiles`, `clients`, `questionnaires`, `questions`, `assessments`, y `answers`.
    *   Si haces clic en la tabla `questions`, verás las 5 preguntas de ejemplo que se insertaron.

¡Y eso es todo! Con estos pasos, tu base de datos estará lista para ser utilizada por la aplicación LoomGather.
