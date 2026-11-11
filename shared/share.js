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

/* A log as a link rather than a file, for chat apps that won't take one: the
   log's JSON, compressed, in a link that opens Mission Companion and offers to
   add it to the mission report. ucnShareLogLink hands it to the share sheet, or
   copies it where there isn't one, and reports through say(text). Long logs
   make long links: Discord takes only about 2,000 characters, so use a chat
   app, email or the file for those. ucnReadLogLink reads one back. */
function ucnB64(bytes) {
  var s = '';
  for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function ucnLogLink(json) {
  var base = new URL('../mission-companion/', location.href).href + '#log=';
  var bytes = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'undefined') return Promise.resolve(base + 'j' + ucnB64(bytes));
  var packed = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Response(packed).arrayBuffer().then(function (buf) { return base + 'z' + ucnB64(new Uint8Array(buf)); });
}
function ucnReadLogLink(data) {
  try {
    var raw = atob(String(data).slice(1).replace(/-/g, '+').replace(/_/g, '/'));
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    if (data.charAt(0) === 'j') return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
    if (data.charAt(0) !== 'z' || typeof DecompressionStream === 'undefined') return Promise.reject(new Error('unreadable'));
    var unpacked = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(unpacked).text().then(JSON.parse);
  } catch (e) { return Promise.reject(e); }
}
function ucnShareLogLink(json, title, say) {
  function copy(url) {
    return window.navigator.clipboard.writeText(url).then(
      function () { say('Link copied: send it to whoever writes the report.'); },
      function () { window.prompt('Copy this link and send it to whoever writes the report:', url); });
  }
  return ucnLogLink(json).then(function (url) {
    if (!window.navigator.share) return copy(url);
    return window.navigator.share({ title: title, url: url }).then(
      function () { say('Link shared.'); },
      function (err) { if (!err || err.name !== 'AbortError') return copy(url); });
  });
}
