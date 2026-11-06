/* Sends a log through the phone's own share sheet (WhatsApp, AirDrop, email,
   Files...), so it reaches whoever is writing the mission report without a
   download-and-find-the-file step. Only offered where the browser can share
   files. ucnShareFile resolves false if the person closes the sheet, and
   rejects if sharing itself failed, so the caller can download instead.
   Plain ES5, as some of the tools are. */
function ucnCanShareFiles() {
  try {
    return !!(window.navigator.canShare && window.File && window.navigator.canShare({
      files: [new window.File(['{}'], 'log.json', { type: 'application/json' })]
    }));
  } catch (e) { return false; }
}
function ucnShareFile(blob, name, title) {
  var file = new window.File([blob], name, { type: blob.type || 'application/json' });
  return window.navigator.share({ files: [file], title: title }).then(
    function () { return true; },
    function (err) {
      if (err && err.name === 'AbortError') return false;
      throw err;
    });
}
