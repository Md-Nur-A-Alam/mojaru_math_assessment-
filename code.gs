/**
 * Mojaru – Class 3 Math Assessment backend (Google Apps Script)
 * ------------------------------------------------------------
 * Project: https://script.google.com/u/0/home/projects/1Wqtlvq0sRr0Yl77T-A2rQYYceYeXZEhyOmGOLbZgqk87JzgAnsuG5JJY/edit
 * Sheet:   https://docs.google.com/spreadsheets/d/11AmKQqW0TQMoGWgTgZU134g7N9OZMrB4RS5-sL-lUYc/edit?gid=0#gid=0
 *
 * Stores:
 *   Timestamp | Student Name | Class | Roll | Date | Time Taken (sec) | QS-1 ... QS-10
 */

const SPREADSHEET_ID = '11AmKQqW0TQMoGWgTgZU134g7N9OZMrB4RS5-sL-lUYc';
const SHEET_NAME = ''; // leave '' to use the first sheet tab

const QUESTION_HEADERS = ['QS-1','QS-2','QS-3','QS-4','QS-5','QS-6','QS-7','QS-8','QS-9','QS-10'];
const META_HEADERS = ['Timestamp', 'Student Name', 'Class', 'Roll', 'Date', 'Time Taken (sec)'];

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
  while (next > 0 && !row[next - 1]) next--; // ignore trailing blanks
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
    lock.waitLock(25000);

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const now = new Date();

    const name = clean_(body.name);
    const roll = clean_(body.roll);
    if (!name || !roll) return json_({ ok: false, error: 'Name and roll are required' });

    // Store Class and default Date to current timestamp if empty
    const studentClass = clean_(body.class || body.studentClass || 'Class 3');
    const timeZone = Session.getScriptTimeZone() || 'Asia/Dhaka';
    const defaultDateStr = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd HH:mm:ss');
    const date = clean_(body.date) || defaultDateStr;

    const answers = body.answers || {};
    const sheet = getSheet_();
    const cols = ensureHeaders_(sheet, META_HEADERS.concat(QUESTION_HEADERS));

    const width = Math.max(sheet.getLastColumn(), Object.keys(cols).length);
    const row = new Array(width).fill('');

    row[cols['Timestamp'] - 1] = now;
    row[cols['Student Name'] - 1] = name;
    row[cols['Class'] - 1] = studentClass;
    row[cols['Roll'] - 1] = roll;
    row[cols['Date'] - 1] = date;
    row[cols['Time Taken (sec)'] - 1] = Number(body.durationSec) || '';

    QUESTION_HEADERS.forEach(h => {
      if (cols[h]) {
        row[cols[h] - 1] = clean_(answers[h]);
      }
    });

    sheet.appendRow(row);
    return json_({ ok: true, timestamp: defaultDateStr });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Opening the Web App URL in a browser shows this – handy for testing the deployment. */
function doGet() {
  return json_({
    ok: true,
    service: 'Mojaru Math Assessment API',
    spreadsheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  });
}
