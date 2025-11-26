
HeredaFácil - Proyecto web (estático + interactividad)
=====================================================

Contenido:
- index.html : Página principal con formulario interactivo y resultados
- assets/style.css : Estilos
- assets/app.js : Lógica de formulario, heurísticas y búsqueda de notarías (Nominatim)
- Imagen proporcionada por el usuario incluida en la raíz (referenciada desde index.html)

Instrucciones:
1. Descomprime el archivo heredafacil.zip en tu proyecto o abre directamente la carpeta en Visual Studio Code.
2. Recomendado: instalar extensión Live Server y abrir index.html con Live Server para evitar restricciones CORS al usar APIs públicas.
3. El botón "Buscar notarías" utiliza OpenStreetMap / Nominatim para buscar notarías por departamento (sin API key).
4. El chat de inteligencia artificial no está implementado en front-end sin servidor. Para integrarlo:
   - Crea un endpoint en tu servidor (ej: /api/chat) que llame a la API de OpenAI u otro servicio.
   - En assets/app.js, añade lógica para enviar/recibir mensajes al endpoint.
   - No incluyas claves en el front-end.
5. El PDF se genera con jsPDF en el navegador.

Notas legales:
HeredaFácil ofrece orientación preliminar y no reemplaza asesoría jurídica profesional.
