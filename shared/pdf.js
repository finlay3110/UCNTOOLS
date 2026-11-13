/* What the UCN mission reports share, so they number their pages and write
   their dates the same way: Mission Companion, Engineering, Navigation,
   General Log, the Mess Log and Mission Stats. Plain ES5, as some of the
   tools are. */

// "3 / 10" at the foot of every page after the cover. Call it last, once
// every page exists; the 20mm bottom margin leaves room above the frame.
function ucnPdfPageNumbers(doc, font) {
  var total = doc.internal.getNumberOfPages();
  var w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
  for (var i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont(font, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 152, 191);
    doc.text(i + ' / ' + total, w / 2, h - 11, { align: 'center' });
  }
}

// A date as the reports write it, "31 Aug 2182", from "YYYY-MM-DD" in any
// year. Anything else comes back as it was, and nothing as a dash.
function ucnPdfDate(ymd) {
  var m = /^(\d{1,6})-(\d{2})-(\d{2})$/.exec(String(ymd == null ? '' : ymd).trim());
  if (!m || +m[2] < 1 || +m[2] > 12) return ymd ? String(ymd) : '—';
  return (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] + ' ' + m[1];
}
