/* Name and rank are shared by the UCN tools on this site: type them into one
   tool and the others fill them in for you, but only into fields that are
   still empty, so nothing a tool already holds is ever replaced.
   Each tool calls ucnSharedProfile({ name, rank, rankOther, write }) with its
   own field ids; write:false only reads (the ID card is often made for
   someone else). Plain ES5, as some of the tools are. */
function ucnSharedProfile(ids) {
  var KEY = 'ucnProfile_v1';
  var get = function (id) { return id ? document.getElementById(id) : null; };
  var name = get(ids.name), rank = get(ids.rank), other = get(ids.rankOther);

  function read() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY));
      return p && typeof p === 'object' ? p : {};
    } catch (e) { return {}; }
  }
  function save(field, value) {
    value = (value || '').trim();
    if (!value || ids.write === false) return;
    var p = read();
    if (p[field] === value) return;
    p[field] = value;
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* storage blocked */ }
  }
  function fire(el, type) {
    var ev = document.createEvent('Event');
    ev.initEvent(type, true, true);
    el.dispatchEvent(ev);
  }
  // The rank as a person reads it, whatever form this tool keeps it in.
  function rankText() {
    if (!rank) return '';
    if (rank.tagName !== 'SELECT') return rank.value;
    if (rank.value === '__other__') return other ? other.value : '';
    return rank.value ? rank.options[rank.selectedIndex].text : '';
  }
  function putRank(value) {
    if (rank.tagName !== 'SELECT') {
      // A searchable picker opens its list on 'input' and settles the value
      // (and closes the list) on 'blur', so finish as if the person moved on.
      rank.value = value; fire(rank, 'input'); fire(rank, 'change'); fire(rank, 'blur');
      return;
    }
    var want = value.toLowerCase();
    for (var i = 0; i < rank.options.length; i++) {
      var o = rank.options[i];
      if (o.value && o.value !== '__other__' &&
          (o.value.toLowerCase() === want || o.text.trim().toLowerCase() === want)) {
        rank.value = o.value; fire(rank, 'change');
        return;
      }
    }
    if (other) {
      rank.value = '__other__'; fire(rank, 'change');
      other.value = value; fire(other, 'input'); fire(other, 'change');
    }
  }
  function fill() {
    var p = read();
    if (name && p.name && !name.value.trim()) { name.value = p.name; fire(name, 'input'); fire(name, 'change'); }
    if (rank && p.rank && !rankText().trim()) putRank(p.rank);
  }

  if (name) name.addEventListener('input', function () { save('name', name.value); });
  // Rank text boxes are searchable pickers: only keep what is left once the
  // person moves on, not each half-typed search.
  [rank, other].forEach(function (el) {
    if (!el) return;
    ['change', 'blur'].forEach(function (type) {
      el.addEventListener(type, function () { save('rank', rankText()); });
    });
  });
  // After the tool has put its own saved values back.
  if (document.readyState === 'complete') setTimeout(fill, 0);
  else window.addEventListener('load', function () { setTimeout(fill, 0); });
}
