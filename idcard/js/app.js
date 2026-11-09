
(function(){
  const $ = id => document.getElementById(id);

  // ---- pronouns (optional, shown next to the name) ----
  // declared early since fitNameRow/syncText('name') below depend on it
  const pronounsSelect = $('f-pronouns');
  const pronounsOther = $('f-pronouns-other');
  const pronounsPreview = $('p-pronouns');
  const namePreviewEl = $('p-name');
  const nameRow = namePreviewEl.closest('.info-row.name');

  function fitNameRow(){
    namePreviewEl.style.fontSize = '';
    pronounsPreview.style.fontSize = '';
    const available = nameRow.clientWidth;
    if(!available) return;
    let nameSize = 23, pronounSize = 13;
    let guard = 0;
    while(nameRow.scrollWidth > available && nameSize > 13 && guard++ < 20){
      nameSize -= 1;
      namePreviewEl.style.fontSize = nameSize + 'px';
    }
    guard = 0;
    while(pronounsPreview.textContent && nameRow.scrollWidth > available && pronounSize > 8 && guard++ < 20){
      pronounSize -= 1;
      pronounsPreview.style.fontSize = pronounSize + 'px';
    }
  }

  function syncPronouns(){
    let val;
    if(pronounsSelect.value === '__other__'){
      pronounsOther.style.display = 'block';
      val = pronounsOther.value.trim();
    } else {
      pronounsOther.style.display = 'none';
      val = pronounsSelect.value;
    }
    pronounsPreview.textContent = val ? `(${val.toUpperCase()})` : '';
    fitNameRow();
  }
  pronounsSelect.addEventListener('change', syncPronouns);
  pronounsOther.addEventListener('input', syncPronouns);

  const fields = {
    name: $('f-name'),
    task: $('f-task'), id: $('f-id'),
  };
  const preview = {
    name: $('p-name'),
    task: $('p-task'), id: $('p-id'),
  };
  const defaults = {
    name: 'NAME',
    task: 'WARSPITE TASK GROUP', id: 'UCN-000-0000',
  };

  function syncText(key){
    const val = fields[key].value.trim();
    preview[key].textContent = val ? val.toUpperCase() : defaults[key];
    if(key === 'name') fitNameRow();
  }

  Object.keys(fields).forEach(key=>{
    fields[key].addEventListener('input', ()=>{
      syncText(key);
      if(key === 'id') renderCode();
    });
    syncText(key);
  });

  // ---- rank (fixed dropdown) ----
  const rankSelect = $('f-rank');
  const rankPreview = $('p-rank');
  function syncRank(){
    rankPreview.textContent = rankSelect.value ? rankSelect.value : 'RANK';
  }
  rankSelect.addEventListener('change', syncRank);
  syncRank();
  syncPronouns();

  // ---- division (dropdown, with "Other" revealing free text) ----
  const shipSelect = $('f-ship');
  const shipOther = $('f-ship-other');
  const shipPreview = $('p-ship');
  function syncShip(){
    let val;
    if(shipSelect.value === '__other__'){
      shipOther.style.display = 'block';
      val = shipOther.value.trim();
    } else {
      shipOther.style.display = 'none';
      val = shipSelect.value;
    }
    shipPreview.textContent = val ? val.toUpperCase() : 'SHIP';
  }
  shipSelect.addEventListener('change', syncShip);
  shipOther.addEventListener('input', syncShip);
  syncShip();

  const divisionSelect = $('f-division');
  const divisionOther = $('f-division-other');
  const divisionPreview = $('p-division');
  function syncDivision(){
    let val;
    if(divisionSelect.value === '__other__'){
      divisionOther.style.display = 'block';
      val = divisionOther.value.trim();
    } else {
      divisionOther.style.display = 'none';
      val = divisionSelect.value;
    }
    divisionPreview.textContent = val ? val.toUpperCase() : 'DIVISION';
  }
  divisionSelect.addEventListener('change', syncDivision);
  divisionOther.addEventListener('input', syncDivision);
  syncDivision();

  // ---- clearance level (fixed dropdown, recolors the header band) ----
  // The band carries a white label in both the preview and the PDF, so these
  // have to stay dark enough to read against it - a true amber (#FFBF00) only
  // manages 1.65:1 and is unusable here.
  const CLEARANCE_COLORS = {
    EMERALD:  '#1F8A55',
    AMBER:    '#A8620E',
    SCARLET:  '#C41E3A',
    OBSIDIAN: '#1C1C1E',
    GRAVIUM:  '#6B3FA0',
  };
  const watchSelect = $('f-watch');
  const watchPreview = $('p-watch');
  function syncClearance(){
    const value = watchSelect.value;
    watchPreview.textContent = value || 'EMERALD';
    const color = CLEARANCE_COLORS[value] || CLEARANCE_COLORS.EMERALD;
    document.querySelectorAll('.card-header').forEach(el=>{
      el.style.setProperty('--clearance-color', color);
      el.classList.toggle('sparkle', value === 'OBSIDIAN');
      el.classList.toggle('gravium', value === 'GRAVIUM');
    });
  }
  watchSelect.addEventListener('change', syncClearance);
  syncClearance();

  // ---- photo upload (local only, never leaves the browser) ----
  const photoInput = $('f-photo');
  const photoBox = $('p-photo');
  const photoThumb = $('photoThumb');
  const chooseBtn = $('choosePhoto');
  const clearBtn = $('clearPhoto');

  // held here rather than read back out of style.backgroundImage, which each
  // browser is free to re-serialize however it likes
  let photoDataUrl = null;

  // only ever a local data: URI - never a remote address that would make the
  // page fetch something off-device
  function isLocalImageDataUrl(value){
    return typeof value === 'string' && /^data:image\/[a-z0-9.+-]+[;,]/i.test(value);
  }
  function cssUrl(dataUrl){
    return 'url("' + dataUrl.replace(/["\\]/g, encodeURIComponent) + '")';
  }

  chooseBtn.addEventListener('click', ()=> photoInput.click());
  photoInput.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const url = ev.target.result;
      if(!isLocalImageDataUrl(url)) return;
      photoDataUrl = url;
      photoBox.style.backgroundImage = cssUrl(url);
      photoBox.textContent = '';
      photoThumb.style.backgroundImage = cssUrl(url);
      photoThumb.textContent = '';
      clearBtn.style.display = 'inline';
      queueSave();
    };
    reader.readAsDataURL(file);
  });
  clearBtn.addEventListener('click', ()=>{
    photoInput.value = '';
    photoDataUrl = null;
    photoBox.style.backgroundImage = '';
    photoBox.textContent = 'CLICK TO ADD PHOTO';
    photoThumb.style.backgroundImage = '';
    photoThumb.textContent = 'NO PHOTO';
    clearBtn.style.display = 'none';
  });

  // ---- barcode / QR toggle ----
  let codeMode = 'barcode'; // 'barcode' | 'qr'
  const barcodeBtn = $('codeBarcodeBtn');
  const qrBtn = $('codeQrBtn');
  const codeRender = $('p-codeRender');
  const codeBox = codeRender.closest('.code-box');
  const qrLengthHint = $('qr-length-hint');

  const BARCODE_ID_MAXLENGTH = 20;
  barcodeBtn.addEventListener('click', ()=>{
    codeMode = 'barcode';
    barcodeBtn.classList.add('active');
    qrBtn.classList.remove('active');
    fields.id.setAttribute('maxlength', String(BARCODE_ID_MAXLENGTH));
    // maxlength won't trim a value that's already too long - anything typed
    // while QR mode had the limit lifted has to be cut back by hand
    if(fields.id.value.length > BARCODE_ID_MAXLENGTH){
      fields.id.value = fields.id.value.slice(0, BARCODE_ID_MAXLENGTH);
      syncText('id');
    }
    qrLengthHint.style.display = 'none';
    renderCode();
  });
  qrBtn.addEventListener('click', ()=>{
    codeMode = 'qr';
    qrBtn.classList.add('active');
    barcodeBtn.classList.remove('active');
    fields.id.removeAttribute('maxlength');
    qrLengthHint.style.display = 'block';
    renderCode();
  });

  function renderCode(){
    const value = (fields.id.value.trim() || defaults.id);
    codeRender.innerHTML = '';
    codeBox.classList.toggle('qr-mode', codeMode === 'qr');
    if(codeMode === 'barcode'){
      if(typeof JsBarcode === 'undefined'){
        codeRender.innerHTML = '<span class="code-fallback">Barcode library didn\'t load — check your internet connection and reload the page.</span>';
        return;
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      codeRender.appendChild(svg);
      try{
        JsBarcode(svg, value, {
          format:'CODE128', displayValue:false, height:46, margin:0,
          background:'transparent', lineColor:'#0B1230',
        });
      }catch(e){
        codeRender.innerHTML = '<span class="code-fallback">Can\'t make a barcode from that text — try letters, numbers, and dashes only.</span>';
      }
    } else {
      if(typeof QRCode === 'undefined'){
        codeRender.innerHTML = '<span class="code-fallback">QR code library didn\'t load — check your internet connection and reload the page.</span>';
        return;
      }
      const holder = document.createElement('div');
      codeRender.appendChild(holder);
      try{
        const fitSize = Math.max(40, Math.floor(Math.min(codeRender.clientWidth, codeRender.clientHeight) * 0.96));
        new QRCode(holder, {
          text:value, width:fitSize, height:fitSize,
          colorDark:'#0B1230', colorLight:'#ffffff',
          correctLevel: QRCode.CorrectLevel.M,
        });
      }catch(e){
        codeRender.innerHTML = '<span class="code-fallback">Couldn\'t generate a QR code for that text.</span>';
      }
    }
  }
  renderCode();

  // ---- random ID generator (UCN-000-0000 format) ----
  $('randomizeId').addEventListener('click', ()=>{
    const part1 = String(Math.floor(Math.random()*1000)).padStart(3,'0');
    const part2 = String(Math.floor(Math.random()*10000)).padStart(4,'0');
    fields.id.value = `UCN-${part1}-${part2}`;
    syncText('id');
    renderCode();
  });

  // ---- PDF generation (jsPDF, drawn directly - no browser print dependency) ----
  // Fonts and images are fetched from their real files and base64-encoded at
  // runtime (only once, then cached) - this only works when served over
  // http(s), not opened directly as a file:// path.

  // Card geometry in inches (CR-80). HEADER_FRAC/FOOTER_FRAC are mirrored in
  // css/style.css as .card-body's top/bottom percentages - keep the two in step.
  const CARD_W = 3.370, CARD_H = 2.125;
  const HEADER_FRAC = 0.222, FOOTER_FRAC = 0.098;
  const PHOTO_RATIO = 35/45; // UK passport photo

  function arrayBufferToBase64(buffer){
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for(let i = 0; i < bytes.length; i += chunkSize){
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  const assetCache = {};
  async function fetchBase64(path){
    if(assetCache[path]) return assetCache[path];
    const resp = await fetch(path);
    if(!resp.ok) throw new Error('Failed to load ' + path);
    const buf = await resp.arrayBuffer();
    const b64 = arrayBufferToBase64(buf);
    assetCache[path] = b64;
    return b64;
  }

  const IMG_PATHS = {
    logoWhite: 'assets/logo-white.png',
    logoNavy: 'assets/logo-navy-flat.png',
    gravium: 'assets/gravium-bg.png',
    obsidian: 'assets/obsidian-bg.png',
  };
  async function loadImageB64(key){
    return fetchBase64(IMG_PATHS[key]);
  }

  const FONT_LIST = [
    ['fonts/Exo2-Regular.ttf', 'Exo2-Regular.ttf', 'Exo2'],
    ['fonts/Exo2-SemiBold.ttf', 'Exo2-SemiBold.ttf', 'Exo2SemiBold'],
    ['fonts/Exo2-ExtraBold.ttf', 'Exo2-ExtraBold.ttf', 'Exo2ExtraBold'],
    ['fonts/Exo2-SemiBoldItalic.ttf', 'Exo2-SemiBoldItalic.ttf', 'Exo2SemiBoldItalic'],
    ['fonts/Exo2-BoldItalic.ttf', 'Exo2-BoldItalic.ttf', 'Exo2BoldItalic'],
    ['fonts/Orbitron-Bold.ttf', 'Orbitron-Bold.ttf', 'OrbitronBold'],
    ['fonts/Orbitron-Black.ttf', 'Orbitron-Black.ttf', 'OrbitronBlack'],
  ];
  // jsPDF keeps its virtual filesystem on the document instance, so every new
  // doc needs its own registration pass - a "have we done this yet" flag would
  // leave the second and later PDFs silently falling back to Helvetica. The
  // expensive part (fetch + base64) is cached in assetCache, so this is cheap.
  async function registerFonts(doc){
    for(const [path, vfsName, family] of FONT_LIST){
      const b64 = await fetchBase64(path);
      doc.addFileToVFS(vfsName, b64);
      doc.addFont(vfsName, family, 'normal');
    }
  }

  function hexToRgb(hex){
    const h = hex.replace('#','');
    return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)];
  }

  // Barcodes and QR codes go into the PDF as shapes, not pictures, so they print
  // sharp at any size and in the PDF's own colours (CMYK in the print files).
  // Returns the dark parts in module units, or null if the text won't encode.
  function codeShapes(value, mode){
    try{
      const bars = [];
      if(mode === 'qr'){
        const qr = new QRCode(document.createElement('div'), {text: value, correctLevel: QRCode.CorrectLevel.M})._oQRCode;
        const n = qr.getModuleCount();
        for(let r = 0; r < n; r++){
          for(let c = 0; c < n; c++){
            let run = 0;
            while(c + run < n && qr.isDark(r, c + run)) run++;
            if(run){ bars.push([c, r, run, 1]); c += run; }
          }
        }
        return {w: n, h: n, bars};
      }
      const out = {};
      JsBarcode(out, value, {format: 'CODE128'});
      const bits = out.encodings.map(e => e.data).join('');
      for(let i = 0; i < bits.length; i++){
        let run = 0;
        while(bits[i + run] === '1') run++;
        if(run){ bars.push([i, 0, run, 23]); i += run; }
      }
      // 23 modules tall: the on-screen barcode's shape (2px bars, 46px high)
      return {w: bits.length, h: 23, bars};
    }catch(e){ return null; }
  }

  function drawCode(doc, code, x, y, w, h){
    doc.setFillColor(...hexToRgb('#0B1230'));
    for(const [bx, by, bw, bh] of code.bars){
      doc.rect(x + bx*w/code.w, y + by*h/code.h, bw*w/code.w, bh*h/code.h, 'F');
    }
  }

  // White card with a navy edge, and later drawing clipped to it. A print shop
  // file (bleed: how far past the cut line, in inches) runs the white past the
  // edge instead, with no line to cut along.
  function cardBase(doc, CX, CY, bleed){
    doc.setFillColor(255,255,255);
    if(bleed){
      doc.rect(CX-bleed.x, CY-bleed.y, CARD_W+2*bleed.x, CARD_H+2*bleed.y, 'F');
      doc.saveGraphicsState();
      return;
    }
    doc.setDrawColor(...hexToRgb('#1B2A5E'));
    doc.setLineWidth(0.02);
    doc.roundedRect(CX, CY, CARD_W, CARD_H, 0.06, 0.06, 'FD');
    doc.saveGraphicsState();
    doc.roundedRect(CX, CY, CARD_W, CARD_H, 0.06, 0.06);
    doc.clip();
    doc.discardPath();
  }

  // Print shop files: every colour set from here on is written as CMYK, by the
  // same plain conversion The Plastic Card Factory's own designer uses. Pictures
  // (photo, logos, header textures) stay RGB for their press to convert.
  function useCmyk(doc){
    for(const name of ['setDrawColor', 'setFillColor', 'setTextColor']){
      const set = doc[name].bind(doc);
      doc[name] = (r, g, b)=>{
        const k = 1 - Math.max(r, g, b)/255;
        return k === 1 ? set(0, 0, 0, 1) : set(...[r, g, b].map(v => (1 - v/255 - k)/(1 - k)), k);
      };
    }
  }

  // The preview shows photos with CSS `center/cover` - cropped, aspect kept -
  // but jsPDF's addImage stretches whatever it's given to fill the box. Crop to
  // the card's photo ratio first so the print matches what's on screen.
  const photoCropCache = new Map();
  function cropPhotoToRatio(dataUrl, ratio){
    if(!dataUrl) return Promise.resolve(null);
    const cached = photoCropCache.get(dataUrl);
    if(cached) return Promise.resolve(cached);
    return new Promise(resolve=>{
      const img = new Image();
      img.onload = ()=>{
        const srcW = img.naturalWidth, srcH = img.naturalHeight;
        if(!srcW || !srcH){ resolve(dataUrl); return; }
        let sw = srcW, sh = srcH, sx = 0, sy = 0;
        if(srcW/srcH > ratio){ sw = srcH*ratio; sx = (srcW-sw)/2; }
        else { sh = srcW/ratio; sy = (srcH-sh)/2; }
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(Math.min(sw, 700)));
        out.height = Math.max(1, Math.round(out.width/ratio));
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, out.width, out.height);
        let result;
        try{ result = out.toDataURL('image/jpeg', 0.92); }
        catch(e){ result = dataUrl; }
        photoCropCache.set(dataUrl, result);
        resolve(result);
      };
      img.onerror = ()=> resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function withCroppedPhoto(card){
    return Object.assign({}, card, {photo: await cropPhotoToRatio(card.photo, PHOTO_RATIO)});
  }

  function drawCardFront(doc, CX, CY, imgB64, cardData, bleed){
    const bx = bleed ? bleed.x : 0, by = bleed ? bleed.y : 0;
    const NAVY = hexToRgb('#1B2A5E');
    const NAVY_DARK = hexToRgb('#0B1230');
    const ORANGE = hexToRgb('#DD7A2B');
    const INK = hexToRgb('#20222B');
    const MUTED = hexToRgb('#8890A6');
    const LINE = hexToRgb('#DADFEC');
    const RED = hexToRgb('#B23A3A');

    cardBase(doc, CX, CY, bleed);

    // ---- watermark (faint logo, centered in white body area) ----
    const HEADER_H = HEADER_FRAC * CARD_H;
    const FOOTER_H = FOOTER_FRAC * CARD_H;
    const wmSize = (CARD_H - HEADER_H - FOOTER_H) * 0.85;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({opacity: 0.06}));
    doc.addImage('data:image/png;base64,'+imgB64.logoNavy, 'PNG',
      CX + CARD_W/2 - wmSize/2, CY + HEADER_H + (CARD_H-HEADER_H-FOOTER_H)/2 - wmSize/2, wmSize, wmSize);
    doc.restoreGraphicsState();

    // ---- header band ----
    const clearanceVal = cardData.watch || 'EMERALD';
    const clearanceHex = CLEARANCE_COLORS[clearanceVal] || CLEARANCE_COLORS.EMERALD;
    const band = [CX-bx, CY-by, CARD_W+2*bx, HEADER_H+by];
    if(clearanceVal === 'GRAVIUM'){
      doc.addImage('data:image/png;base64,'+imgB64.gravium, 'PNG', ...band);
    } else if(clearanceVal === 'OBSIDIAN'){
      doc.addImage('data:image/png;base64,'+imgB64.obsidian, 'PNG', ...band);
    } else {
      doc.setFillColor(...hexToRgb(clearanceHex));
      doc.rect(...band, 'F');
    }
    // navy diagonal wedge (in a print file, its slant carries on into the bleed)
    const NAVY_W = 0.64 * CARD_W;
    const wedgeTop = 0.92*NAVY_W + 0.14*NAVY_W*by/HEADER_H;
    doc.setFillColor(...NAVY);
    doc.lines(
      [[wedgeTop+bx,0],[-(wedgeTop-0.78*NAVY_W), HEADER_H+by],[-(0.78*NAVY_W+bx),0]],
      CX-bx, CY-by, [1,1], 'F', true
    );
    // logo
    const logoR = 0.085;
    const logoCx = CX + 0.16, logoCy = CY + HEADER_H/2;
    doc.addImage('data:image/png;base64,'+imgB64.logoWhite, 'PNG', logoCx-logoR, logoCy-logoR, logoR*2, logoR*2);
    // wordmark
    doc.setFont('OrbitronBold','normal');
    doc.setFontSize(6.2);
    doc.setTextColor(255,255,255);
    const wmX = logoCx + logoR + 0.06;
    doc.text('UNITED', wmX, logoCy-0.06);
    doc.text('CONFEDERATION', wmX, logoCy+0.02);
    doc.text('NAVY', wmX, logoCy+0.10);
    // clearance label
    doc.setFont('OrbitronBlack','normal');
    doc.setFontSize(13);
    doc.setTextColor(255,255,255);
    const clearRightX = CX+CARD_W-0.12;
    doc.text(clearanceVal, clearRightX, CY+HEADER_H*0.58, {align:'right'});
    const labelW = doc.getTextWidth(clearanceVal);
    doc.setDrawColor(255,255,255);
    doc.setLineWidth(0.012);
    doc.line(clearRightX-labelW, CY+HEADER_H*0.68, clearRightX, CY+HEADER_H*0.68);

    // ---- photo box (UK passport ratio) ----
    // cardData.photo is pre-cropped to PHOTO_RATIO by the callers, so filling
    // the box here can't distort it.
    const photoW = 0.23*CARD_W, photoH = photoW/PHOTO_RATIO;
    const photoX = CX+0.11, photoY = CY+HEADER_H+0.08;
    if(cardData.photo){
      try{ doc.addImage(cardData.photo, 'JPEG', photoX, photoY, photoW, photoH); }
      catch(e){ try{ doc.addImage(cardData.photo, 'PNG', photoX, photoY, photoW, photoH); }catch(e2){} }
    } else {
      doc.setDrawColor(...NAVY);
      doc.setLineDashPattern([0.02,0.02], 0);
      doc.setLineWidth(0.012);
      doc.rect(photoX, photoY, photoW, photoH, 'D');
      doc.setLineDashPattern([], 0);
      doc.setFont('Exo2','normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text('CLICK TO', photoX+photoW/2, photoY+photoH/2-0.03, {align:'center'});
      doc.text('ADD PHOTO', photoX+photoW/2, photoY+photoH/2+0.05, {align:'center'});
    }

    // ---- barcode / QR ----
    const codeBoxY = photoY+photoH+0.03;
    const codeBoxH = CY+CARD_H-FOOTER_H-codeBoxY - (cardData.codeMode==='barcode' ? 0.13 : 0);
    const code = codeShapes(cardData.id || defaults.id, cardData.codeMode);
    if(code){
      let cw = photoW, ch = codeBoxH;
      const ratio = code.w/code.h;
      if(cardData.codeMode === 'qr'){
        // 2 modules of white above and below, or the footer band under it
        // stops it scanning
        cw = Math.min(photoW, codeBoxH) * code.w/(code.w + 4);
        ch = cw;
      } else {
        ch = Math.min(codeBoxH, cw/ratio);
        cw = ch*ratio;
      }
      drawCode(doc, code, photoX+(photoW-cw)/2, codeBoxY+(codeBoxH-ch)/2, cw, ch);
    }
    if(cardData.codeMode === 'barcode'){
      doc.setFont('Exo2','normal');
      doc.setTextColor(...INK);
      const idVal = cardData.id || defaults.id;
      // shrink to stay inside the photo column instead of running into the
      // info column next to it
      let idFontSize = 7;
      doc.setFontSize(idFontSize);
      while(doc.getTextWidth(idVal) > photoW && idFontSize > 4){
        idFontSize -= 0.25;
        doc.setFontSize(idFontSize);
      }
      doc.text(idVal, photoX, CY+CARD_H-FOOTER_H-0.06);
      doc.setDrawColor(...NAVY_DARK);
      doc.setLineWidth(0.01);
      doc.line(photoX, CY+CARD_H-FOOTER_H-0.04, photoX+photoW, CY+CARD_H-FOOTER_H-0.04);
    }

    // ---- info column ----
    const colX = photoX+photoW+0.13;
    const colW = CX+CARD_W-0.11-colX;
    let rowY = CY+HEADER_H+0.24;

    // name (+ pronouns), auto-shrinking to fit the available column width
    doc.setFont('Exo2ExtraBold','normal');
    let nameFontSize = 15;
    doc.setFontSize(nameFontSize);
    const nameVal = (cardData.name || defaults.name).toUpperCase();
    let nameW = doc.getTextWidth(nameVal);
    while(nameW > colW && nameFontSize > 8){
      nameFontSize -= 0.5;
      doc.setFontSize(nameFontSize);
      nameW = doc.getTextWidth(nameVal);
    }

    const pronounsVal = cardData.pronouns;
    const pronounsText = pronounsVal ? '('+pronounsVal.toUpperCase()+')' : '';
    let pronounsFontSize = 8.5;
    let pronounsW = 0;
    if(pronounsText){
      doc.setFont('Exo2','normal');
      doc.setFontSize(pronounsFontSize);
      pronounsW = doc.getTextWidth(pronounsText);
      while(nameW + 0.06 + pronounsW > colW && pronounsFontSize > 5){
        pronounsFontSize -= 0.5;
        doc.setFontSize(pronounsFontSize);
        pronounsW = doc.getTextWidth(pronounsText);
      }
      while(nameW + 0.06 + pronounsW > colW && nameFontSize > 8){
        nameFontSize -= 0.5;
        doc.setFont('Exo2ExtraBold','normal');
        doc.setFontSize(nameFontSize);
        nameW = doc.getTextWidth(nameVal);
      }
    }

    doc.setFont('Exo2ExtraBold','normal');
    doc.setFontSize(nameFontSize);
    doc.setTextColor(...INK);
    doc.text(nameVal, colX, rowY);
    if(pronounsText){
      doc.setFont('Exo2','normal');
      doc.setFontSize(pronounsFontSize);
      doc.setTextColor(...MUTED);
      doc.text(pronounsText, colX+nameW+0.06, rowY);
    }
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.014);
    doc.line(colX, rowY+0.035, colX+colW, rowY+0.035);
    rowY += 0.17;

    // rank
    doc.setFont('Exo2','normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(cardData.rank || 'RANK', colX, rowY);
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.012);
    doc.line(colX, rowY+0.028, colX+colW, rowY+0.028);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.006);
    doc.line(colX, rowY+0.045, colX+colW, rowY+0.045);
    rowY += 0.19;

    // ship
    doc.setFont('Exo2','normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text((cardData.ship || 'SHIP').toUpperCase(), colX, rowY);
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.012);
    doc.line(colX, rowY+0.028, colX+colW, rowY+0.028);
    rowY += 0.17;

    // division
    doc.setFont('Exo2SemiBoldItalic','normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...ORANGE);
    doc.text((cardData.division || 'DIVISION').toUpperCase(), colX, rowY);
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.012);
    doc.line(colX, rowY+0.028, colX+colW, rowY+0.028);
    rowY += 0.16;

    // notice
    doc.setFont('Exo2BoldItalic','normal');
    doc.setFontSize(6);
    doc.setTextColor(...RED);
    doc.text('This crew member is NOT a permanent member of crew.', colX, rowY);

    // ---- footer ----
    doc.setFillColor(...NAVY);
    doc.rect(CX-bx, CY+CARD_H-FOOTER_H, CARD_W+2*bx, FOOTER_H+by, 'F');
    doc.setFont('OrbitronBold','normal');
    doc.setFontSize(9);
    doc.setTextColor(255,255,255);
    doc.text((cardData.task || defaults.task).toUpperCase(), CX+0.11, CY+CARD_H-FOOTER_H/2+0.03);

    doc.restoreGraphicsState();
  }

  function drawCardBack(doc, CX, CY, imgB64, bleed){
    const NAVY = hexToRgb('#1B2A5E');
    const MUTED = hexToRgb('#8890A6');

    cardBase(doc, CX, CY, bleed);

    const midX = CX + CARD_W/2;

    // small navy logo + wordmark near the top
    const logoR = 0.08;
    doc.addImage('data:image/png;base64,'+imgB64.logoNavy, 'PNG', midX-logoR, CY+0.14, logoR*2, logoR*2);
    doc.setFont('OrbitronBold','normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...NAVY);
    doc.text('UNITED CONFEDERATION NAVY', midX, CY+0.14+logoR*2+0.13, {align:'center'});

    // QR code, centered
    const qrSize = 1.05;
    const qrY = CY+0.62;
    const qr = codeShapes('https://finlay3110.github.io/UCNTOOLS/', 'qr');
    if(qr) drawCode(doc, qr, midX-qrSize/2, qrY, qrSize, qrSize);
    doc.setFont('Exo2SemiBold','normal');
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.text('finlay3110.github.io/UCNTOOLS', midX, qrY+qrSize+0.14, {align:'center'});

    // disclaimer
    doc.setFont('Exo2','normal');
    doc.setFontSize(5.2);
    doc.setTextColor(...MUTED);
    const disclaimer = 'The UCN logo is the property of Bridge Command / The London Space Elevator Limited. This is a fan-made project and is not approved by or affiliated with Bridge Command / The London Space Elevator Limited.';
    doc.text(disclaimer, midX, CY+CARD_H-0.22, {align:'center', maxWidth: CARD_W-0.3});

    doc.restoreGraphicsState();
  }

  function getCurrentCardData(){
    let pronouns = pronounsSelect.value;
    if(pronouns === '__other__') pronouns = pronounsOther.value.trim();
    let ship = shipSelect.value;
    if(ship === '__other__') ship = shipOther.value.trim();
    let division = divisionSelect.value;
    if(division === '__other__') division = divisionOther.value.trim();
    return {
      name: fields.name.value.trim(),
      pronouns,
      rank: rankSelect.value,
      ship,
      division,
      watch: watchSelect.value,
      task: fields.task.value.trim(),
      id: fields.id.value.trim(),
      codeMode,
      photo: photoDataUrl,
    };
  }

  async function buildPdf(mode){
    const { jsPDF } = window.jspdf;
    const GUTTER = 0.18;
    const cardData = await withCroppedPhoto(getCurrentCardData());

    const imgB64 = {
      logoWhite: await loadImageB64('logoWhite'),
      logoNavy: await loadImageB64('logoNavy'),
      gravium: await loadImageB64('gravium'),
      obsidian: await loadImageB64('obsidian'),
    };

    if(mode === 'front' || mode === 'back'){
      // The Plastic Card Factory's artwork size: the card plus 3mm bleed all
      // round, 92x60mm, one side per file (their designer takes each side as
      // its own background image).
      const W = 92/25.4, H = 60/25.4, bleed = {x: (W-CARD_W)/2, y: (H-CARD_H)/2};
      const doc = new jsPDF({unit:'in', format:[W, H], orientation:'l'});
      await registerFonts(doc);
      useCmyk(doc);
      if(mode === 'front') drawCardFront(doc, bleed.x, bleed.y, imgB64, cardData, bleed);
      else drawCardBack(doc, bleed.x, bleed.y, imgB64, bleed);
      return doc;
    }

    if(mode === 'card'){
      const doc = new jsPDF({unit:'in', format:[CARD_W, CARD_H], orientation:'l'});
      await registerFonts(doc);
      drawCardFront(doc, 0, 0, imgB64, cardData);
      doc.addPage([CARD_W, CARD_H], 'l');
      drawCardBack(doc, 0, 0, imgB64);
      return doc;
    }

    // ---- mode === 'a4' ----
    const MARGIN_LEFT = 0.7, MARGIN_TOP = 0.7;
    const doc = new jsPDF({unit:'in', format:'a4', orientation:'p'});
    await registerFonts(doc);
    const A4_W = doc.internal.pageSize.getWidth();

    const CX = MARGIN_LEFT + GUTTER, CY = MARGIN_TOP + GUTTER;
    doc.setDrawColor(154,160,172);
    doc.setLineDashPattern([0.03, 0.03], 0);
    doc.setLineWidth(0.01);
    doc.rect(MARGIN_LEFT, MARGIN_TOP, CARD_W + GUTTER*2, CARD_H + GUTTER*2, 'D');
    doc.setLineDashPattern([], 0);
    drawCardFront(doc, CX, CY, imgB64, cardData);

    // back page: mirrored horizontally so it lines up when duplex-printed (flip on long edge)
    doc.addPage('a4', 'p');
    const backCX = A4_W - CX - CARD_W;
    doc.setDrawColor(154,160,172);
    doc.setLineDashPattern([0.03, 0.03], 0);
    doc.setLineWidth(0.01);
    doc.rect(A4_W - MARGIN_LEFT - GUTTER*2 - CARD_W, MARGIN_TOP, CARD_W + GUTTER*2, CARD_H + GUTTER*2, 'D');
    doc.setLineDashPattern([], 0);
    drawCardBack(doc, backCX, CY, imgB64);

    return doc;
  }

  // ============================================================
  // Export / import / batch printing
  // ============================================================
  const BATCH_FILE_VERSION = 1;

  function exportCard(){
    const data = getCurrentCardData();
    const payload = { ucnCardVersion: BATCH_FILE_VERSION, ...data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (data.name || 'ucn-card').toLowerCase().replace(/[^a-z0-9]+/g,'-') + '.ucncard.json';
    a.click();
    // revoking in the same tick can cancel the download before it starts
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
  }

  const batchQueue = [];

  function renderBatchList(){
    const listEl = $('batchList');
    const actionsEl = $('batchActions');
    listEl.innerHTML = '';
    batchQueue.forEach((card, i)=>{
      const item = document.createElement('div');
      item.className = 'batch-item';
      const thumb = document.createElement('div');
      thumb.className = 'batch-item-thumb';
      if(card.photo) thumb.style.backgroundImage = cssUrl(card.photo);
      const name = document.createElement('span');
      name.className = 'batch-item-name';
      name.textContent = card.name || 'Unnamed';
      const removeBtn = document.createElement('button');
      removeBtn.className = 'batch-item-remove';
      removeBtn.type = 'button';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Remove from batch';
      removeBtn.addEventListener('click', ()=>{
        batchQueue.splice(i, 1);
        renderBatchList();
      });
      item.appendChild(thumb);
      item.appendChild(name);
      item.appendChild(removeBtn);
      listEl.appendChild(item);
    });
    if(batchQueue.length){
      const countEl = document.createElement('p');
      countEl.className = 'batch-count';
      countEl.textContent = `${batchQueue.length} card${batchQueue.length===1?'':'s'} queued (${Math.ceil(batchQueue.length/10)} sheet${Math.ceil(batchQueue.length/10)===1?'':'s'} of paper, double-sided)`;
      listEl.appendChild(countEl);
    }
    actionsEl.style.display = batchQueue.length ? 'block' : 'none';
  }

  function importCardFiles(fileList){
    Array.from(fileList).forEach(file=>{
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          if(!data || typeof data !== 'object' || typeof data.ucnCardVersion !== 'number'){
            throw new Error('not a card file');
          }
          if(data.ucnCardVersion > BATCH_FILE_VERSION){
            alert(`"${file.name}" was made by a newer version of this tool. Some details may be missing.`);
          }
          const str = v => typeof v === 'string' ? v : '';
          batchQueue.push({
            name: str(data.name), pronouns: str(data.pronouns), rank: str(data.rank),
            ship: str(data.ship), division: str(data.division), watch: str(data.watch) || 'EMERALD',
            task: str(data.task), id: str(data.id),
            codeMode: data.codeMode === 'qr' ? 'qr' : 'barcode',
            // card files come from other people - a remote URL here would have
            // the page fetch it, so only accept an inline image
            photo: isLocalImageDataUrl(data.photo) ? data.photo : null,
          });
          renderBatchList();
        }catch(e){
          alert(`Couldn't read "${file.name}" — is it a card file exported from this tool?`);
        }
      };
      reader.readAsText(file);
    });
  }

  async function buildBatchPdf(rawCards){
    const { jsPDF } = window.jspdf;
    const cols = 2, rows = 5, perPage = cols*rows;
    const gapX = 0.2, gapY = 0.15;

    const imgB64 = {
      logoWhite: await loadImageB64('logoWhite'),
      logoNavy: await loadImageB64('logoNavy'),
      gravium: await loadImageB64('gravium'),
      obsidian: await loadImageB64('obsidian'),
    };

    const doc = new jsPDF({unit:'in', format:'a4', orientation:'p'});
    await registerFonts(doc);
    const A4_W = doc.internal.pageSize.getWidth();
    const A4_H = doc.internal.pageSize.getHeight();
    const totalW = cols*CARD_W + (cols-1)*gapX;
    const totalH = rows*CARD_H + (rows-1)*gapY;
    const marginX = (A4_W - totalW)/2;
    const marginY = (A4_H - totalH)/2;

    function cutMark(x, y){
      doc.setDrawColor(154,160,172);
      doc.setLineDashPattern([0.03, 0.03], 0);
      doc.setLineWidth(0.008);
      doc.rect(x-0.04, y-0.04, CARD_W+0.08, CARD_H+0.08, 'D');
      doc.setLineDashPattern([], 0);
    }

    // crop each card's photo once
    const cards = [];
    for(const card of rawCards) cards.push(await withCroppedPhoto(card));

    const pageCount = Math.max(1, Math.ceil(cards.length / perPage));
    for(let p = 0; p < pageCount; p++){
      if(p > 0) doc.addPage('a4', 'p');
      const pageCards = cards.slice(p*perPage, (p+1)*perPage);
      pageCards.forEach((card, i)=>{
        const col = i % cols, row = Math.floor(i / cols);
        const x = marginX + col*(CARD_W+gapX);
        const y = marginY + row*(CARD_H+gapY);
        cutMark(x, y);
        drawCardFront(doc, x, y, imgB64, card);
      });

      // back page: same grid, mirrored horizontally per-card so each one lines
      // up correctly when duplex-printed (flip on long edge)
      doc.addPage('a4', 'p');
      pageCards.forEach((card, i)=>{
        const col = i % cols, row = Math.floor(i / cols);
        const mirroredCol = cols - 1 - col;
        const x = marginX + mirroredCol*(CARD_W+gapX);
        const y = marginY + row*(CARD_H+gapY);
        cutMark(x, y);
        drawCardBack(doc, x, y, imgB64);
      });
    }

    return doc;
  }

  async function downloadBatchPdf(){
    const btn = $('downloadBatchBtn');
    const originalLabel = btn.textContent;
    btn.textContent = 'Generating…';
    btn.disabled = true;
    try{
      const doc = await buildBatchPdf(batchQueue);
      doc.save(`ucn-crew-batch-${batchQueue.length}-cards.pdf`);
    }catch(e){
      console.error(e);
      alert('Could not generate the batch PDF. Please check your internet connection and try again.');
    }finally{
      btn.textContent = originalLabel;
      btn.disabled = false;
    }
  }

  $('exportCardBtn').addEventListener('click', exportCard);
  $('importCardBtn').addEventListener('click', ()=> $('importCardInput').click());
  $('importCardInput').addEventListener('change', e=>{
    if(e.target.files.length) importCardFiles(e.target.files);
    e.target.value = '';
  });
  $('addToBatchBtn').addEventListener('click', ()=>{
    batchQueue.push(getCurrentCardData());
    renderBatchList();
  });
  $('downloadBatchBtn').addEventListener('click', downloadBatchPdf);
  $('clearBatchBtn').addEventListener('click', ()=>{
    if(batchQueue.length && confirm('Clear all ' + batchQueue.length + ' queued card(s)?')){
      batchQueue.length = 0;
      renderBatchList();
    }
  });


  async function downloadCardPdf(mode, btn){
    const originalLabel = btn.textContent;
    btn.textContent = 'Generating…';
    btn.disabled = true;
    try{
      const doc = await buildPdf(mode);
      const filename = (fields.name.value.trim() || 'ucn-id-card').toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + mode + '.pdf';
      doc.save(filename);
    }catch(e){
      console.error(e);
      alert('Could not generate the PDF. Please check your internet connection (fonts/images load from this site) and try again.');
    }finally{
      btn.textContent = originalLabel;
      btn.disabled = false;
    }
  }

  $('printA4Btn').addEventListener('click', ()=> downloadCardPdf('a4', $('printA4Btn')));
  $('printCardBtn').addEventListener('click', ()=> downloadCardPdf('card', $('printCardBtn')));
  $('printFrontBtn').addEventListener('click', ()=> downloadCardPdf('front', $('printFrontBtn')));
  $('printBackBtn').addEventListener('click', ()=> downloadCardPdf('back', $('printBackBtn')));

  // The card preview is drawn at a fixed 520px. On a narrower screen, zoom it out
  // to fit instead of letting it push the whole page wider than the phone.
  const card = $('card'), stage = card.parentElement;
  function fitPreview(){
    card.style.zoom = '';
    const cs = getComputedStyle(stage);
    const room = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if(room > 0 && room < card.offsetWidth) card.style.zoom = String(room / card.offsetWidth);
  }
  window.addEventListener('resize', fitPreview);
  fitPreview();

  // ---- remember the card on this device ----
  // Saved after every edit and put back on the next visit, so closing the tab
  // no longer loses the card. Same shape as a card file.
  const SAVE_KEY = 'ucnIdCard_v1';
  let saveTimer = null, shrunkFrom = null, shrunk = null;

  // A phone photo is several MB as text, more than a browser lets one site
  // store, so the saved copy is scaled down. 1000px is still far more than a
  // printed card photo needs; the full-size photo stays in use until reload.
  function shrinkPhoto(dataUrl){
    return new Promise(resolve=>{
      const img = new Image();
      img.onload = ()=>{
        const k = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k);
        c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try{ resolve(c.toDataURL('image/jpeg', 0.9)); }catch(e){ resolve(null); }
      };
      img.onerror = ()=> resolve(null);
      img.src = dataUrl;
    });
  }
  async function saveCard(){
    const original = photoDataUrl;
    let photo = original;
    if(photo && photo.length > 400000){
      // One shrink per photo, shared by every save that arrives while it runs.
      if(shrunkFrom !== photo){ shrunkFrom = photo; shrunk = shrinkPhoto(photo); }
      photo = await shrunk;
      // The photo changed meanwhile: the save queued for the new one stores it.
      if(photoDataUrl !== original) return;
    }
    // Read the form only now, so typing done during the wait is never lost.
    const data = getCurrentCardData();
    data.photo = photo;
    try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
    catch(e){
      // storage full or blocked: keep the text at least
      try{ data.photo = null; localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }catch(e2){}
    }
  }
  function queueSave(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveCard, 300); }
  const formPanel = document.querySelector('.form-panel');
  ['input', 'change', 'click'].forEach(type => formPanel.addEventListener(type, queueSave));

  // Put a value back through the same events a person's typing would fire,
  // so every preview and "Other" box updates exactly as it does by hand.
  function put(el, value, type){
    el.value = value;
    el.dispatchEvent(new Event(type, {bubbles:true}));
  }
  function putChoice(select, other, value){
    if(!value) return;
    if(Array.from(select.options).some(o => o.value === value)){ put(select, value, 'change'); return; }
    if(other){ put(select, '__other__', 'change'); put(other, value, 'input'); }
  }
  function applyCard(data){
    const str = v => typeof v === 'string' ? v : '';
    put(fields.name, str(data.name), 'input');
    putChoice(pronounsSelect, pronounsOther, str(data.pronouns));
    putChoice(rankSelect, null, str(data.rank));
    putChoice(shipSelect, shipOther, str(data.ship));
    putChoice(divisionSelect, divisionOther, str(data.division));
    putChoice(watchSelect, null, str(data.watch));
    put(fields.task, str(data.task), 'input');
    (data.codeMode === 'qr' ? qrBtn : barcodeBtn).click();
    put(fields.id, str(data.id), 'input');
    if(isLocalImageDataUrl(data.photo)){
      photoDataUrl = data.photo;
      photoBox.style.backgroundImage = cssUrl(data.photo);
      photoBox.textContent = '';
      photoThumb.style.backgroundImage = cssUrl(data.photo);
      photoThumb.textContent = '';
      clearBtn.style.display = 'inline';
    }
  }
  try{
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if(saved && typeof saved === 'object') applyCard(saved);
  }catch(e){ /* nothing saved, or storage blocked */ }
  clearTimeout(saveTimer); // restoring is not an edit

  $('newCardBtn').addEventListener('click', e=>{
    e.stopPropagation();
    if(!confirm('Clear the form and start a new card? Export this one first if you want to keep it.')) return;
    try{ localStorage.removeItem(SAVE_KEY); }catch(err){}
    location.reload();
  });
})();
