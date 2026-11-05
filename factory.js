var mintMs = NEZO.MINT_INTERVAL;

function initFactory() {
  drawFactory();
  var savedNext = parseInt(localStorage.getItem('nz_next_mint') || '0');
  var now       = Date.now();
  mintMs = (savedNext > now) ? (savedNext - now) : NEZO.MINT_INTERVAL;
  if (!(savedNext > now)) localStorage.setItem('nz_next_mint', (now + NEZO.MINT_INTERVAL).toString());
  updateMintUI();
  setInterval(function() {
    mintMs -= 1000;
    if (mintMs <= 0) {
      mintMs = NEZO.MINT_INTERVAL;
      localStorage.setItem('nz_next_mint', (Date.now() + NEZO.MINT_INTERVAL).toString());
      doMint();
    }
    updateMintUI();
  }, 1000);
}

function doMint() {
  var ns = getSupply() + 1;
  setSupply(ns);

  // chaque nouveau coin injecte de la pression acheteuse
  var pumpPct = 0.003 + Math.random() * 0.007; // +0.3% à +1% par mint
  var newPrice = getPrice() * (1 + pumpPct);
  setPrice(newPrice);
  setLiq(getLiq() + newPrice * 0.5);            // un peu de liq en plus
  setMcap(newPrice * ns);
  pushPrice(newPrice);

  addMintLog(ns);
  animateMint();
  updateAllUI();
}

function addMintLog(supply) {
  var log = el('mint-log');
  if (!log) return;
  var e = document.createElement('div');
  e.className = 'mint-log-entry';
  e.innerHTML = '<span>' + new Date().toLocaleTimeString('fr-FR') + '</span>'
    + '<span>+1 NZ (total : ' + fmt(supply) + ')</span>';
  var title = log.querySelector('.mint-log-title');
  if (title) title.after(e); else log.prepend(e);
  var all = log.querySelectorAll('.mint-log-entry');
  if (all.length > 10) all[all.length - 1].remove();
}

function animateMint() {
  var stage = el('coin-stage');
  if (!stage) return;
  stage.innerHTML = '';

  var coinWrap = document.createElement('div');
  coinWrap.style.cssText = 'position:absolute;bottom:10px;animation:coinMint .6s ease-out forwards;';
  coinWrap.innerHTML = createBillSVG(10, 190, 84);
  stage.appendChild(coinWrap);

  setTimeout(function() {
    var hand = document.createElement('div');
    hand.style.cssText = 'position:absolute;bottom:0;font-size:56px;animation:handGrab 2.2s ease-in-out forwards;transform-origin:bottom center;';
    hand.textContent = '🤚';
    stage.appendChild(hand);
    setTimeout(function() { stage.innerHTML = ''; }, 2400);
  }, 3200);
}

function updateMintUI() {
  var m  = Math.max(0, mintMs);
  var mn = Math.floor(m / 60000);
  var sc = Math.floor((m % 60000) / 1000);
  setText('mint-timer', (mn < 10 ? '0' : '') + mn + ':' + (sc < 10 ? '0' : '') + sc);
  setText('mint-total', fmt(getSupply()));
}

function drawFactory() {
  var svg = el('factory-svg');
  if (!svg) return;

  var wins1 = [170,230,290,350,410].map(function(x) {
    return '<rect x="' + x + '" y="175" width="38" height="28" rx="2" fill="#d0e8f0" stroke="#333" stroke-width="1.4"/>';
  }).join('');
  var wins2 = [170,230,350,410].map(function(x) {
    return '<rect x="' + x + '" y="220" width="38" height="28" rx="2" fill="#d0e8f0" stroke="#333" stroke-width="1.4"/>';
  }).join('');
  var convLines = [500,518,536,554,572].map(function(x) {
    return '<line x1="' + x + '" y1="288" x2="' + x + '" y2="299" stroke="#666" stroke-width="1"/>';
  }).join('');

  svg.innerHTML =
    '<rect width="600" height="380" fill="#f9f9f9"/>'
  + '<rect x="0" y="330" width="600" height="50" fill="#ebebeb"/>'
  + '<line x1="0" y1="330" x2="600" y2="330" stroke="#333" stroke-width="2"/>'

  /* Building */
  + '<path d="M 140 330 L 140 155 Q 142 153 144 155 L 490 155 Q 492 153 490 155 L 490 330"'
  + ' fill="white" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>'
  + '<path d="M 138 157 L 492 157" stroke="#222" stroke-width="1.5"/>'
  + '<path d="M 138 165 L 492 165" stroke="#222" stroke-width=".7"/>'

  + wins1 + wins2

  /* Sign */
  + '<rect x="265" y="216" width="118" height="36" rx="3" fill="#0a0a0a" stroke="#3b82f6" stroke-width="1.5"/>'
  + '<text x="324" y="239" font-family="\'Courier New\',monospace" font-size="12" font-weight="bold" fill="#3b82f6" text-anchor="middle">NEZO MINT</text>'

  /* Door */
  + '<path d="M 282 330 L 282 282 Q 320 274 358 282 L 358 330" fill="#ccc" stroke="#333" stroke-width="1.5"/>'
  + '<circle cx="352" cy="308" r="4" fill="#888" stroke="#333" stroke-width="1"/>'

  /* Smokestack 1 */
  + '<rect x="195" y="88" width="29" height="70" fill="#e0e0e0" stroke="#222" stroke-width="2"/>'
  + '<path d="M 191 90 Q 210 86 230 90" fill="#c8c8c8" stroke="#222" stroke-width="1.4"/>'
  + '<circle cx="210" cy="82" r="6" fill="rgba(140,140,140,0)">'
  + '<animate attributeName="cy" values="85;40" dur="2.6s" repeatCount="indefinite"/>'
  + '<animate attributeName="fill-opacity" values="0.5;0" dur="2.6s" repeatCount="indefinite"/>'
  + '<animate attributeName="r" values="6;15" dur="2.6s" repeatCount="indefinite"/>'
  + '</circle>'
  + '<circle cx="208" cy="70" r="8" fill="rgba(130,130,130,0)">'
  + '<animate attributeName="cy" values="78;28" dur="3.2s" begin=".9s" repeatCount="indefinite"/>'
  + '<animate attributeName="fill-opacity" values="0.4;0" dur="3.2s" begin=".9s" repeatCount="indefinite"/>'
  + '<animate attributeName="r" values="8;19" dur="3.2s" begin=".9s" repeatCount="indefinite"/>'
  + '</circle>'

  /* Smokestack 2 */
  + '<rect x="390" y="96" width="27" height="62" fill="#e0e0e0" stroke="#222" stroke-width="2"/>'
  + '<path d="M 387 98 Q 404 94 419 98" fill="#c8c8c8" stroke="#222" stroke-width="1.4"/>'
  + '<circle cx="403" cy="88" r="5" fill="rgba(140,140,140,0)">'
  + '<animate attributeName="cy" values="92;48" dur="2.1s" begin="1.3s" repeatCount="indefinite"/>'
  + '<animate attributeName="fill-opacity" values="0.5;0" dur="2.1s" begin="1.3s" repeatCount="indefinite"/>'
  + '<animate attributeName="r" values="5;13" dur="2.1s" begin="1.3s" repeatCount="indefinite"/>'
  + '</circle>'

  /* Conveyor */
  + '<rect x="488" y="288" width="90" height="11" rx="4" fill="#444" stroke="#222" stroke-width="1.5"/>'
  + convLines
  + '<rect x="490" y="299" width="6" height="22" fill="#333"/>'
  + '<rect x="566" y="299" width="6" height="22" fill="#333"/>'

  /* Output slot + pipe */
  + '<rect x="482" y="268" width="11" height="22" rx="2" fill="#1a1a1a" stroke="#333" stroke-width="1"/>'
  + '<line x1="488" y1="252" x2="488" y2="288" stroke="#888" stroke-width="3" stroke-linecap="round"/>'
  + '<circle cx="488" cy="250" r="5" fill="#666" stroke="#444" stroke-width="1"/>'

  /* Activity pulse window */
  + '<rect x="290" y="220" width="38" height="28" rx="2" stroke="#333" stroke-width="1.4">'
  + '<animate attributeName="fill" values="rgba(59,130,246,.15);rgba(59,130,246,.55);rgba(59,130,246,.15)" dur="2.2s" repeatCount="indefinite"/>'
  + '</rect>';
}
