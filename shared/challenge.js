// What the three trainers (Hacking Trainer, Bridge Drills, Scan Trainer) share:
// challenge links and the records picture. An ES module each trainer imports,
// and caches for offline use in its sw.js.

// A repeatable random: the same seed always gives the same game, which is how
// a friend can be challenged to it.
export const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
export const newSeed = () => 1 + Math.floor(Math.random() * 2147483645);

// Text to and from the URL-safe base64 a challenge link carries.
export const toB64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const fromB64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));

// The records picture through the phone's share sheet, or as a download where
// it can't share it. Called straight from the tap, so the share sheet counts as
// opened by it.
export function sharePicture(png, name, title) {
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(png);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  // Tested with the picture itself: some phones share pictures but not other files.
  const file = new File([png], name, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title }).catch(e => { if (e.name !== 'AbortError') download(); });
  } else download();
}
