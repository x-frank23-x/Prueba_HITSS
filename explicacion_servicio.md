Tener en cuenta para que se ejecute es que debemos crear un un archivo .env en el frontend que seran dos .env.example .env que deberan tener el mismo contenido 

VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000
VITE_MOCK_EMPTY=true

esto para que no use los datos de prueba en el frontend y nos deje trabajar con los archivos reales

y ahora si con la explicacion
----------------------------------------------------------
Servicio de clasificación de alarmas (alarmClassifier.py)
----------------------------------------------------------
Descripción general

Este servicio alarmClassifier.py esta encargado de que nos calcule el tiempo que transcurrio desde la creación de una alarma y determinar su nivel de criticidad.

Para realizar esto, tiene en cuenta el tiempo de actividad, el estado de las tecnologías 2G, 3G y 4G, y si la alarma ha sido notificada.
---------------
Funcionamiento
---------------
El servicio se construyo en base a dos funciones principales:

calculateTextDuration(seconds)

Recibe el tiempo transcurrido en segundos y lo convierte a un formato más sencillo de leer, expresado en horas y minutos.

Por ejemplo, 4070 segundos se convierten en 1h 7m.

classifyAlarm(...)

Esta es la función encargada de analizar los datos de la alarma y asignar su criticidad. Para ello:

Calcula el tiempo transcurrido desde su creación.

Identifica las tecnologías disponibles, descartando aquellas con valores negativos.

Comprueba si todas las tecnologías disponibles se encuentran al 100 %.

Verifica si la alarma está sin notificar (N).

Según estas condiciones y el tiempo transcurrido, determina su nivel de criticidad.
------------------------
Reglas de clasificación
------------------------
Para que una alarma pueda ser clasificada como WARN o CRITICAL, todas las tecnologías disponibles deben estar al 100 % y la alarma debe estar sin notificar.

Tiempo transcurrido

Criticidad

Hasta 1 hora

NORMAL

Más de 1 hora y hasta 24 horas

WARN

Más de 24 horas

CRITICAL

Si no se cumplen las condiciones de las tecnologías y notificación, la alarma permanece como NORMAL.
-------------
Resultado
-------------
La función classifyAlarm() devuelve un objeto con tres datos:

durationHours: tiempo transcurrido expresado en horas.

durationText: tiempo convertido a horas y minutos.

criticality: nivel de criticidad asignado a la alarma.


