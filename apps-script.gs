/**
 * VITALAE — Google Apps Script
 *
 * Este script hace DOS cosas:
 *   1. Guarda las respuestas del cuestionario en la hoja "Respuestas"
 *   2. Cuenta y devuelve el número de visitas al sitio (hoja "Contador")
 *
 * INSTRUCCIONES DE INSTALACIÓN — Sigue exactamente estos pasos:
 *
 * PASO 1: Abre tu Google Sheet
 *   https://docs.google.com/spreadsheets/d/1CvDz8odzYO9t4-dRMjMcvqw41LfTZlJ0-6PnzJ51Vps/edit
 *
 * PASO 2: Menú superior → Extensiones → Apps Script
 *   Se abre una pestaña nueva con un editor de código.
 *
 * PASO 3: Borra TODO el código que aparece (habrá "function myFunction() {}")
 *
 * PASO 4: Copia y pega TODO el contenido de este archivo dentro del editor
 *
 * PASO 5: Guarda con Ctrl+S (o el ícono de disco 💾)
 *   El proyecto te va a pedir un nombre. Ponle "Vitalae".
 *
 * PASO 6: Haz clic en "Desplegar" (arriba a la derecha) → "Nueva implementación"
 *
 * PASO 7: Junto a "Seleccionar tipo" hay un ícono de engranaje ⚙️.
 *   Haz clic ahí y elige "Aplicación web".
 *
 * PASO 8: Configura EXACTAMENTE así:
 *   - Descripción: "Vitalae endpoint"
 *   - Ejecutar como: "Yo (tu-email@gmail.com)"
 *   - Quién tiene acceso: **CUALQUIER PERSONA** (muy importante)
 *
 * PASO 9: Haz clic en "Desplegar"
 *
 * PASO 10: Google te pedirá autorización.
 *   - Elige tu cuenta
 *   - Verás "Google no verificó esta app" → clic en "Configuración avanzada"
 *   - Clic en "Ir a Vitalae (no seguro)"
 *   - Clic en "Permitir"
 *
 * PASO 11: Copia la URL que aparece. Termina en "/exec". Ejemplo:
 *   https://script.google.com/macros/s/AKfycbz.../exec
 *
 * PASO 12: Abre tu index.html en un editor de texto. Busca esta línea:
 *   APPS_SCRIPT_URL: 'REPLACE_WITH_YOUR_APPS_SCRIPT_URL',
 *   Reemplaza el texto de comillas por tu URL. Guarda.
 *
 * PASO 12.b (OPCIONAL — WhatsApp Business):
 *   En el mismo CONFIG busca esta línea:
 *     WA_PHONE: '',
 *   Pon tu número de WhatsApp Business en formato internacional SIN "+":
 *     Chile: '56912345678'
 *   Esto hace que todos los botones del sitio abran tu WhatsApp Business
 *   directamente, con mensajes bien formateados por contexto.
 *
 * PASO 13: Sube el index.html actualizado a GitHub. Listo.
 *
 * PASO 14 (VERIFICACIÓN): Abre la URL del Web App en tu navegador.
 *   Si ves algo como {"status":"ok","service":"Vitalae"...} funciona bien.
 *   Si ves error, revisa que hayas puesto "Cualquier persona" en el paso 8.
 */

// ============================
// CONFIGURACIÓN
// ============================
const RESPONSES_SHEET = 'Respuestas';
const COUNTER_SHEET = 'Contador';

// ============================
// doGet — Maneja el contador de visitas (via JSONP)
// ============================
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'status';

  // Contador de visitas
  if (action === 'visit') {
    const count = incrementVisitCounter();
    return jsonpResponse({ status: 'ok', count: count }, params.callback);
  }

  // Solo leer el contador sin incrementar
  if (action === 'count') {
    const count = getVisitCounter();
    return jsonpResponse({ status: 'ok', count: count }, params.callback);
  }

  // Guardar respuesta del quiz (para casos donde POST no funciona por CORS)
  if (action === 'save') {
    try {
      const data = {
        timestamp: params.timestamp || new Date().toISOString(),
        genero: params.genero || '',
        edad: params.edad || '',
        usa_cannabis: params.usa || '',
        forma_uso: params.forma || '',
        referrer: params.referrer || 'direct',
        user_agent: params.ua || ''
      };
      saveQuizResponse(data);
      return jsonpResponse({ status: 'saved' }, params.callback);
    } catch (err) {
      return jsonpResponse({ status: 'error', message: String(err) }, params.callback);
    }
  }

  // Status por defecto (verificar que el endpoint funciona)
  return jsonpResponse({
    status: 'ok',
    service: 'Vitalae endpoint',
    timestamp: new Date().toISOString(),
    actions: ['visit', 'count', 'save']
  }, params.callback);
}

// ============================
// doPost — Maneja respuestas del quiz (via POST)
// ============================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveQuizResponse(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'saved' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================
// Guardar respuesta del quiz
// ============================
function saveQuizResponse(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(RESPONSES_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(RESPONSES_SHEET);
    sheet.appendRow([
      'Fecha',
      'Hora',
      'Género',
      'Edad',
      'Usa cannabis',
      'Forma de uso',
      'Referrer',
      'User Agent'
    ]);
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2D5F4F');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 100);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 130);
    sheet.setColumnWidth(5, 120);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(7, 200);
    sheet.setColumnWidth(8, 300);
  }

  const timestamp = new Date(data.timestamp || new Date());
  const fecha = Utilities.formatDate(timestamp, 'America/Santiago', 'yyyy-MM-dd');
  const hora = Utilities.formatDate(timestamp, 'America/Santiago', 'HH:mm:ss');

  const generoMap = {
    'femenino': 'Femenino',
    'masculino': 'Masculino',
    'no-binario': 'No binario',
    'prefiero-no-decir': 'Prefiero no decirlo'
  };
  const edadMap = {
    '18-24': 'Entre 18 y 24 años',
    '25-64': 'Entre 25 y 64 años',
    '65+': '65 años o más'
  };
  const usaMap = { 'si': 'Sí', 'no': 'No' };
  const formaMap = {
    'alimento': 'Alimento (oral)',
    'vaporizada': 'Vaporización',
    'combustion': 'Combustión'
  };

  sheet.appendRow([
    fecha,
    hora,
    generoMap[data.genero] || data.genero || '',
    edadMap[data.edad] || data.edad || '',
    usaMap[data.usa_cannabis] || data.usa_cannabis || '',
    formaMap[data.forma_uso] || data.forma_uso || '',
    data.referrer || '',
    data.user_agent || ''
  ]);
}

// ============================
// Contador de visitas
// ============================
function incrementVisitCounter() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(COUNTER_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(COUNTER_SHEET);
    sheet.appendRow(['Métrica', 'Valor', 'Última actualización']);
    const headerRange = sheet.getRange(1, 1, 1, 3);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2D5F4F');
    headerRange.setFontColor('#FFFFFF');
    sheet.appendRow(['Visitas totales', 0, '']);
    sheet.setFrozenRows(1);
  }

  // Fila 2 = visitas totales
  const currentValue = sheet.getRange(2, 2).getValue() || 0;
  const newValue = Number(currentValue) + 1;
  sheet.getRange(2, 2).setValue(newValue);
  sheet.getRange(2, 3).setValue(new Date());

  return newValue;
}

function getVisitCounter() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(COUNTER_SHEET);
  if (!sheet) return 0;
  return Number(sheet.getRange(2, 2).getValue()) || 0;
}

// ============================
// Helper para responder con JSONP o JSON según callback
// ============================
function jsonpResponse(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================
// Función de test (opcional — puedes ejecutarla desde el editor de Apps Script)
// ============================
function testSetup() {
  // Simular una visita
  const count = incrementVisitCounter();
  Logger.log('Nueva visita registrada. Total: ' + count);

  // Simular una respuesta del quiz
  saveQuizResponse({
    timestamp: new Date().toISOString(),
    genero: 'femenino',
    edad: '25-64',
    usa_cannabis: 'no',
    forma_uso: '',
    referrer: 'test',
    user_agent: 'Apps Script Test'
  });
  Logger.log('Respuesta de prueba guardada.');
}
