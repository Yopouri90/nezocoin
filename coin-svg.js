function createBillSVG(denom, w, h) {
  denom = denom || 10;
  w     = w     || 450;
  h     = h     || 200;
  var cw  = w / 9;
  var ch  = h / 4;
  var ds  = String(denom);
  var uid = 'b' + denom + '_' + w;

  var grid = '';
  for (var c = 1; c < 9; c++)
    grid += '<line x1="' + (c*cw) + '" y1="0" x2="' + (c*cw) + '" y2="' + h + '" stroke="#b8d4e8" stroke-width="0.5"/>';
  for (var r = 1; r < 4; r++)
    grid += '<line x1="0" y1="' + (r*ch) + '" x2="' + w + '" y2="' + (r*ch) + '" stroke="#b8d4e8" stroke-width="0.5"/>';

  var curveLine = '';
  if (ds.length >= 2) {
    curveLine = '<path d="M ' + (13+cw*.44) + ' ' + (ch*.16)
      + ' Q ' + (13+cw*.72) + ' ' + (ch*.54)
      + ' ' + (13+cw*.98) + ' ' + (ch*1.06)
      + '" stroke="black" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
  }

  return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">'

  /* Defs */
  + '<defs>'
  + '<clipPath id="pc' + uid + '"><circle cx="' + (cw*.9) + '" cy="' + (ch*2.88) + '" r="' + (ch*.72) + '"/></clipPath>'
  + '</defs>'

  /* Graph paper background */
  + '<rect width="' + w + '" height="' + h + '" fill="white"/>'
  + grid

  /* Watermark */
  + '<text x="' + (w/2) + '" y="' + (h*.65) + '" font-family="Georgia,serif" font-size="' + (ch*2.6) + '"'
  + ' fill="rgba(0,0,0,0.035)" text-anchor="middle" font-weight="bold" dominant-baseline="middle">NZ</text>'

  /* Double border */
  + '<rect x="2" y="2" width="' + (w-4) + '" height="' + (h-4) + '" fill="none" stroke="black" stroke-width="2.5" rx="2"/>'
  + '<rect x="6" y="6" width="' + (w-12) + '" height="' + (h-12) + '" fill="none" stroke="black" stroke-width="0.7" rx="1"/>'

  /* Denomination top-left */
  + '<text x="13" y="' + (ch*1.08) + '" font-family="\'Courier New\',monospace" font-size="' + (ch*1.0) + '"'
  + ' font-weight="bold" fill="black">' + ds + '</text>'
  + curveLine

  /* AW Signature — rotated 180° (upside-down in the zero) */
  + '<g transform="translate(' + (cw*2.05) + ',' + (ch*.95) + ') rotate(180) scale(.88)">'
  + '<path d="M 0 24 L 11 2 L 22 24" stroke="black" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<line x1="5" y1="15" x2="17" y2="15" stroke="black" stroke-width="1.3" stroke-linecap="round"/>'
  + '<path d="M 22 24 Q 16 14 11 12 L 30 12" stroke="black" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<path d="M 30 12 L 26 22 L 32 13 L 38 22 L 42 12" stroke="black" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<line x1="42" y1="12" x2="47" y2="12" stroke="black" stroke-width="1.1" stroke-linecap="round"/>'
  + '<circle cx="49" cy="12" r="1.5" fill="black"/>'
  + '</g>'

  /* Crown — upper right */
  + '<g transform="translate(' + (cw*5.6) + ',' + (ch*.12) + ')">'
  + '<polyline points="0,' + (ch*1.12)
  + ' 0,' + (ch*.58)
  + ' ' + (cw*.44) + ',' + (ch*.07)
  + ' ' + (cw*.88) + ',' + (ch*.46)
  + ' ' + (cw*1.32) + ',' + (ch*.07)
  + ' ' + (cw*1.76) + ',' + (ch*.46)
  + ' ' + (cw*2.2) + ',0'
  + ' ' + (cw*2.64) + ',' + (ch*.46)
  + ' ' + (cw*2.64) + ',' + (ch*1.12)
  + ' 0,' + (ch*1.12) + '"'
  + ' stroke="black" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
  + '<circle cx="' + (cw*.44)  + '" cy="' + (ch*.07) + '" r="3.5" fill="black"/>'
  + '<circle cx="' + (cw*1.32) + '" cy="' + (ch*.07) + '" r="3.5" fill="black"/>'
  + '<circle cx="' + (cw*2.2)  + '" cy="0" r="3.5" fill="black"/>'
  + '<path d="M ' + (cw*.44) + ' ' + (ch*.66)
  + ' Q ' + (cw*.66) + ' ' + (ch*.95) + ' ' + (cw*.88) + ' ' + (ch*.66)
  + ' Q ' + (cw*1.1) + ' ' + (ch*.95) + ' ' + (cw*1.32) + ' ' + (ch*.66)
  + ' Q ' + (cw*1.54) + ' ' + (ch*.95) + ' ' + (cw*1.76) + ' ' + (ch*.66)
  + ' Q ' + (cw*1.98) + ' ' + (ch*.95) + ' ' + (cw*2.2) + ' ' + (ch*.66) + '"'
  + ' stroke="black" stroke-width="1" fill="none" stroke-linecap="round"/>'
  + '</g>'

  /* EZIO plateau — middle right */
  + '<g transform="translate(' + (cw*4.5) + ',' + (ch*2.08) + ')">'
  + '<line x1="' + (cw*.45) + '" y1="' + (ch*.42) + '" x2="' + (cw*2.9) + '" y2="' + (ch*.42) + '" stroke="black" stroke-width="1.9" stroke-linecap="round"/>'
  + '<path d="M ' + (cw*.45) + ' ' + (ch*.42)
  + ' Q ' + (cw*.25) + ' ' + (ch*.3) + ' ' + (cw*.35) + ' ' + (ch*.1)
  + ' Q ' + (cw*.45) + ' -2 ' + (cw*.28) + ' ' + (ch*.04) + '"'
  + ' stroke="black" stroke-width="1" fill="none" stroke-linecap="round"/>'
  + '<path d="M ' + (cw*2.9) + ' ' + (ch*.42)
  + ' Q ' + (cw*3.1) + ' ' + (ch*.3) + ' ' + (cw*3.0) + ' ' + (ch*.1)
  + ' Q ' + (cw*2.9) + ' -2 ' + (cw*3.07) + ' ' + (ch*.04) + '"'
  + ' stroke="black" stroke-width="1" fill="none" stroke-linecap="round"/>'
  + '<text x="' + (cw*1.68) + '" y="' + (ch*.37) + '" font-family="Georgia,serif" font-size="' + (ch*.38) + '"'
  + ' fill="black" text-anchor="middle" font-style="italic" font-weight="bold">EZIO</text>'
  + '</g>'

  /* Rick & Morty portal — bottom left */
  + '<circle cx="' + (cw*.9) + '" cy="' + (ch*2.88) + '" r="' + (ch*.84) + '" fill="rgba(0,170,0,.06)" stroke="#00bb33" stroke-width="2.4"/>'
  + '<circle cx="' + (cw*.9) + '" cy="' + (ch*2.88) + '" r="' + (ch*.64) + '" fill="rgba(0,170,0,.06)" stroke="#00dd33" stroke-width="1.8"/>'
  + '<circle cx="' + (cw*.9) + '" cy="' + (ch*2.88) + '" r="' + (ch*.47) + '" fill="#001800" stroke="#00ff44" stroke-width="1.5"/>'
  + '<g clip-path="url(#pc' + uid + ')">'
  + '<polyline points="'
  + (cw*.44) + ',' + (ch*3.08) + ' '
  + (cw*.58) + ',' + (ch*2.93) + ' '
  + (cw*.68) + ',' + (ch*3.00) + ' '
  + (cw*.80) + ',' + (ch*2.76) + ' '
  + (cw*.92) + ',' + (ch*2.70) + ' '
  + (cw*1.04) + ',' + (ch*2.80) + ' '
  + (cw*1.17) + ',' + (ch*2.62) + ' '
  + (cw*1.30) + ',' + (ch*2.57) + '"'
  + ' stroke="#00ff44" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '</g>'
  + '<text x="' + (cw*.9) + '" y="' + (ch*3.76) + '" font-family="\'Courier New\',monospace" font-size="' + (ch*.21) + '"'
  + ' fill="#009922" text-anchor="middle">NEZO</text>'

  /* Denom bottom-right faded */
  + '<text x="' + (w-13) + '" y="' + (h-9) + '" font-family="Georgia,serif" font-size="' + (ch*.75) + '"'
  + ' fill="rgba(0,0,0,.28)" text-anchor="end" font-weight="bold">' + ds + '</text>'

  + '</svg>';
}

function renderHeroCoin() {
  var c = el('hero-coin-container');
  if (c) c.innerHTML = createBillSVG(10, 460, 204);
}
