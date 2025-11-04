# Plan de Casos de Prueba para LoomGather

Este documento detalla los casos de prueba para la primera versión de la aplicación "LoomGather", basados en el reporte de funcionalidades implementadas.

## 1. Módulo de Autenticación

| ID Caso | Título | Pasos a Seguir | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **AUT-01** | Inicio de sesión con credenciales válidas | 1. Abrir `index.html`. <br> 2. Ingresar un email y contraseña válidos de un consultor existente. <br> 3. Hacer clic en "Iniciar Sesión". | El usuario es redirigido exitosamente al `dashboard.html`. |
| **AUT-02** | Inicio de sesión con contraseña inválida | 1. Abrir `index.html`. <br> 2. Ingresar un email válido. <br> 3. Ingresar una contraseña incorrecta. <br> 4. Hacer clic en "Iniciar Sesión". | El usuario permanece en la página de login y se muestra un mensaje de error claro (ej. "Credenciales inválidas"). |
| **AUT-03** | Inicio de sesión con email inválido | 1. Abrir `index.html`. <br> 2. Ingresar un email que no existe en la base de datos. <br> 3. Ingresar cualquier contraseña. <br> 4. Hacer clic en "Iniciar Sesión". | El usuario permanece en la página de login y se muestra un mensaje de error. |
| **AUT-04** | Acceso a rutas protegidas sin sesión | 1. Sin haber iniciado sesión, intentar acceder directamente a `dashboard.html`. | El usuario es redirigido a la página de login (`index.html`). |

## 2. Módulo de Seguridad (Row Level Security)

*Se necesitan dos consultores de prueba (Consultor A y Consultor B) con sus propios clientes y evaluaciones.*

| ID Caso | Título | Pasos a Seguir | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **SEC-01** | Aislamiento de datos entre consultores | 1. Iniciar sesión como **Consultor A**. <br> 2. Crear un nuevo levantamiento para un cliente. <br> 3. Cerrar sesión. <br> 4. Iniciar sesión como **Consultor B**. <br> 5. Intentar acceder o visualizar los datos del levantamiento creado por el Consultor A. | El **Consultor B** no puede ver ni acceder a ninguna información (clientes, evaluaciones, respuestas) que pertenezca al **Consultor A**. El dashboard solo muestra los proyectos del Consultor B. |

## 3. Módulo del Dashboard

| ID Caso | Título | Pasos a Seguir | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **DSH-01** | Visualización de la lista de proyectos | 1. Iniciar sesión como un consultor que tenga proyectos existentes. <br> 2. Observar la pantalla `dashboard.html`. | La lista de proyectos del consultor se muestra correctamente. |
| **DSH-02** | Iniciar un nuevo levantamiento | 1. Iniciar sesión. <br> 2. En `dashboard.html`, hacer clic en el botón "Iniciar Nuevo Levantamiento". | El usuario es redirigido a la página `levantamiento.html` para comenzar un nuevo cuestionario. |

## 4. Módulo de Cuestionario Dinámico

| ID Caso | Título | Pasos a Seguir | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **CUE-01** | Carga inicial de preguntas | 1. Iniciar un nuevo levantamiento. <br> 2. Observar la página `levantamiento.html`. | La primera pregunta del cuestionario de ejemplo se carga y se muestra correctamente. El tipo de campo (texto, selección) corresponde al tipo de pregunta. |
| **CUE-02** | Guardado de respuesta y avance | 1. Responder la primera pregunta. <br> 2. Hacer clic en el botón "Siguiente". | La respuesta se guarda en la tabla `answers` de Supabase. La aplicación muestra la segunda pregunta. |
| **CUE-03** | Navegación hacia atrás | 1. Avanzar hasta la pregunta 3. <br> 2. Hacer clic en el botón "Anterior". | La aplicación muestra la pregunta 2. El campo debería mostrar la respuesta previamente guardada. |
| **CUE-04** | Finalización del cuestionario | 1. Responder todas las preguntas del cuestionario. <br> 2. Hacer clic en el botón "Finalizar" en la última pregunta. | El usuario es redirigido de vuelta a `dashboard.html`. Todas las respuestas deben estar guardadas correctamente en la base de datos. |
| **CUE-05** | Validación de campos (Opcional, si existe) | 1. Intentar avanzar a la siguiente pregunta sin responder la actual (si es obligatoria). | La aplicación muestra un mensaje indicando que la pregunta es obligatoria y no permite avanzar. |
