/**
 * Mojaru – Class 3 Math Assessment backend (Google Apps Script)
 * ------------------------------------------------------------
 * Sheet = database. Each submission appends one row.
 *
 * Row 1 must contain the headers QS-1 ... QS-10 (already in your sheet).
 * The script will automatically add these extra columns at the end if missing:
 *   Timestamp | Student Name | Roll | Date | Time Taken (sec)
 *
 * SETUP
 * 1. If this script is NOT bound to the sheet (opened via script.google.com
 *    instead of Extensions > Apps Script), paste the sheet ID below.
 *    (ID = the long string in the sheet URL between /d/ and /edit)
 * 2. Deploy > New deployment > type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 *    Copy the Web app URL into WEB_APP_URL in script.js.
 * 3. After ANY change to this file: Deploy > Manage deployments >
 *    edit (pencil) > Version: New version > Deploy. The URL stays the same.
 */

const SPREADSHEET_ID = '';   // leave '' if the script is bound to the sheet
const SHEET_NAME = '';       // leave '' to use the first tab
const QUESTION_HEADERS = ['QS-1','QS-2','QS-3','QS-4','QS-5','QS-6','QS-7','QS-8','QS-9','QS-10'];
const META_HEADERS = ['Timestamp', 'Student Name', 'Roll', 'Date', 'Time Taken (sec)'];

function getSheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

/** Returns {header: columnIndex(1-based)}; appends any missing headers. */
function ensureHeaders_(sheet, needed) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const row = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  const map = {};
  row.forEach((h, i) => { if (h) map[h] = i + 1; });

  let next = row.length;
  while (next > 0 && !row[next - 1]) next--;   // ignore trailing blanks
  needed.forEach(h => {
    if (!map[h]) {
      next++;
      sheet.getRange(1, next).setValue(h).setFontWeight('bold');
      map[h] = next;
    }
  });
  return map;
}

/** Stop spreadsheet formula injection from student input. */
function clean_(v) {
  let s = String(v == null ? '' : v).trim().slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const name = clean_(body.name);
    const roll = clean_(body.roll);
    if (!name || !roll) return json_({ ok: false, error: 'Name and roll are required' });

    const answers = body.answers || {};
    const sheet = getSheet_();
    const cols = ensureHeaders_(sheet, META_HEADERS.concat(QUESTION_HEADERS));

    const width = Math.max(sheet.getLastColumn(), Object.keys(cols).length);
    const row = new Array(width).fill('');

    row[cols['Timestamp'] - 1] = new Date();
    row[cols['Student Name'] - 1] = name;
    row[cols['Roll'] - 1] = roll;
    row[cols['Date'] - 1] = clean_(body.date);
    row[cols['Time Taken (sec)'] - 1] = Number(body.durationSec) || '';
    QUESTION_HEADERS.forEach(h => { row[cols[h] - 1] = clean_(answers[h]); });

    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Opening the Web App URL in a browser shows this – handy for testing the deployment. */
function doGet() {
  return json_({ ok: true, service: 'Mojaru Math Assessment API' });
}
