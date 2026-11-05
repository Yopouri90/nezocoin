/* ── LocalStorage market state ── */
function mGet(k, def) { var v = localStorage.getItem('nz_m_'+k); return v !== null ? JSON.parse(v) : def; }
function mSet(k, v)   { localStorage.setItem('nz_m_'+k, JSON.stringify(v)); }

function getPrice()    { return mGet('price',    NEZO.INITIAL_PRICE);  }
function getSupply()   { return mGet('supply',   NEZO.INITIAL_SUPPLY); }
function getLiq()      { return mGet('liq',      NEZO.INITIAL_LIQ);    }
function getMcap()     { return mGet('mcap',     NEZO.INITIAL_MCAP);   }
function getVol24()    { return mGet('vol24',    0); }
function getHolders()  { return mGet('holders',  1); }
function getBundlers() { return mGet('bundlers', 0); }
function getSnipers()  { return mGet('snipers',  2); }
function getTxs()      { return mGet('txs',      []); }
function getPriceHist(){ return mGet('phist',    []); }

function setPrice(v)    { mSet('price',    Math.max(0.000000001, v)); }
function setSupply(v)   { mSet('supply',   v); }
function setLiq(v)      { mSet('liq',      Math.max(0, v)); }
function setMcap(v)     { mSet('mcap',     Math.max(0, v)); }
function setVol24(v)    { mSet('vol24',    v); }
function setHolders(v)  { mSet('holders',  Math.max(1, Math.round(v))); }
function setBundlers(v) { mSet('bundlers', Math.max(0, Math.round(v))); }
function setSnipers(v)  { mSet('snipers',  Math.max(0, Math.round(v))); }

function pushTx(tx) {
  var txs = getTxs();
  txs.unshift(tx);
  if (txs.length > 50) txs.length = 50;
  mSet('txs', txs);
}

function pushPrice(p) {
  var h = getPriceHist();
  h.push({ t: Date.now(), p: p });
  if (h.length > 800) h.splice(0, h.length - 800);
  mSet('phist', h);
}

/* ── Boot ── */
var openAt = null;

function initMarket() {
  var lr = parseInt(localStorage.getItem('nz_vol_reset') || '0');
  if (Date.now() - lr > 86400000) {
    setVol24(0);
    localStorage.setItem('nz_vol_reset', Date.now().toString());
  }
  if (getPriceHist().length === 0) seedHistory();
  if (!localStorage.getItem('nz_holder_reg')) localStorage.setItem('nz_holder_reg', '0');
  openAt = getPriceHist()[0] ? getPriceHist()[0].p : getPrice();
  setInterval(priceDrift, NEZO.DRIFT_INTERVAL);
  updateAllUI();
}

function seedHistory() {
  var now  = Date.now();
  var supply = NEZO.INITIAL_SUPPLY;        // 1 000 000
  var mcap = NEZO.INITIAL_MCAP;            // 1 000 €
  var p    = mcap / supply;                // 0.001 € par NZ
  var pts  = [];

  for (var i = 150; i >= 0; i--) {
    // légère tendance haussière (0.49 → monte en moyenne)
    var change = (Math.random() - 0.46) * 0.08;
    p = Math.max(0.0000001, p * (1 + change));
    pts.push({ t: now - i * 60000, p: p });
  }

  mSet('phist', pts);
  setPrice(p);
  setSupply(supply);
  setMcap(p * supply);
  setLiq(NEZO.INITIAL_LIQ);
}

/* ── Position tracking ── */
function getPosition() {
  var raw = localStorage.getItem('nz_position');
  return raw ? JSON.parse(raw) : { totalInvested: 0, avgEntry: 0, totalNz: 0 };
}
function setPosition(p) { localStorage.setItem('nz_position', JSON.stringify(p)); }

function recordBuy(eurSpent, nzGot) {
  var pos = getPosition();
  pos.totalNz       = (pos.totalNz || 0) + nzGot;
  pos.totalInvested = (pos.totalInvested || 0) + eurSpent;
  pos.avgEntry      = pos.totalNz > 0 ? pos.totalInvested / pos.totalNz : 0;
  setPosition(pos);
}

function recordSell(nzSold) {
  var pos = getPosition();
  var ratio = pos.totalNz > 0 ? nzSold / pos.totalNz : 1;
  pos.totalNz       = Math.max(0, (pos.totalNz || 0) - nzSold);
  pos.totalInvested = Math.max(0, (pos.totalInvested || 0) * (1 - ratio));
  if (pos.totalNz < 0.0001) { pos.totalInvested = 0; pos.avgEntry = 0; pos.totalNz = 0; }
  setPosition(pos);
}

function renderPosition() {
  var panel = el('position-panel');
  if (!panel) return;
  var pos   = getPosition();
  var nz    = getNzHeld();

  if (nz < 0.0001) { panel.style.display = 'none'; return; }

  panel.style.display = 'flex';
  var currentVal = nz * getPrice();
  var invested   = pos.totalInvested || 0;
  var pnl        = currentVal - invested;
  var pnlPct     = invested > 0 ? (pnl / invested) * 100 : 0;
  var pnlStr     = (pnl >= 0 ? '+' : '') + '€' + Math.abs(pnl).toFixed(4)
                 + ' (' + (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(2) + '%)';

  setText('pos-invested', '€' + invested.toFixed(4));
  setText('pos-current',  '€' + currentVal.toFixed(4));
  setText('pos-entry',    '€' + (pos.avgEntry || 0).toFixed(8));
  setText('pos-nz',       nz.toFixed(4));

  var pnlEl = el('pos-pnl');
  if (pnlEl) {
    pnlEl.textContent = pnlStr;
    pnlEl.className   = 'position-pnl ' + (pnl > 0.0001 ? 'profit' : pnl < -0.0001 ? 'loss' : 'flat');
  }
}

function priceDrift() {
  var drift = (Math.random() - 0.495) * 0.004;
  var np    = Math.max(0.0000001, getPrice() * (1 + drift));
  setPrice(np);
  setMcap(np * getSupply());
  pushPrice(np);
  updateAllUI();
}

/* ── Trade UI ── */
var tradeMode = 'buy';

function setTradeMode(mode) {
  tradeMode = mode;
  var bt  = el('tab-buy');
  var st  = el('tab-sell');
  var btn = el('trade-btn');
  if (!bt || !st || !btn) return;
  bt.className  = 'trade-tab' + (mode === 'buy'  ? ' active buy-active'  : '');
  st.className  = 'trade-tab' + (mode === 'sell' ? ' active sell-active' : '');
  btn.textContent = mode === 'buy' ? 'Buy NZ' : 'Sell NZ';
  btn.className = 'trade-execute' + (mode === 'sell' ? ' sell-mode' : '');
  setText('trade-balance-unit',    mode === 'buy' ? '€' : 'NZ');
  setText('trade-balance-display', mode === 'buy' ? getEur().toFixed(4) : getNzHeld().toFixed(4));
  setText('trade-unit',    mode === 'buy' ? '€' : 'NZ');
  setText('preview-unit',  mode === 'buy' ? 'NZ' : '€');
  updatePreview();
}

function setQuick(pct) {
  var max = tradeMode === 'buy' ? getEur() : getNzHeld();
  var inp = el('trade-amount');
  if (inp) { inp.value = (max * pct).toFixed(6); updatePreview(); }
}

function updatePreview() {
  var inp   = el('trade-amount');
  var raw   = inp ? (parseFloat(inp.value) || 0) : 0;
  var price = getPrice();
  var liq   = Math.max(0.01, getLiq());
  var res   = 0;
  if (tradeMode === 'buy') {
    res = raw / (price * (1 + (raw / liq) * 0.03));
  } else {
    res = raw * price * Math.max(0.5, 1 - (raw * price / liq) * 0.03);
  }
  setText('preview-amount', res.toFixed(6));
}

function executeTrade() {
  var inp = el('trade-amount');
  var raw = inp ? (parseFloat(inp.value) || 0) : 0;
  if (raw <= 0) return showToast('Montant invalide');
  var price = getPrice();
  var liq   = Math.max(0.01, getLiq());

  if (tradeMode === 'buy') {
    if (raw > getEur()) return showToast('Solde EUR insuffisant');
    var effP   = price * (1 + (raw / liq) * 0.03);
    var nzGot  = raw / effP;
    setEur(getEur() - raw);
    setNzHeld(getNzHeld() + nzGot);
    setLiq(liq + raw * 0.5);
    setVol24(getVol24() + raw);
    setPrice(effP * 1.0015);
    setMcap(getPrice() * getSupply());
    if (localStorage.getItem('nz_holder_reg') === '0') {
      setHolders(getHolders() + 1);
      localStorage.setItem('nz_holder_reg', '1');
    }
    pushPrice(getPrice());
    pushTx({ type:'buy', eur: raw, nz: nzGot, actor:'You', t: Date.now() });
	recordBuy(raw, nzGot);
    showToast('✅ Acheté ' + nzGot.toFixed(4) + ' NZ');

  } else {
    if (raw > getNzHeld()) return showToast('Position NZ insuffisante');
    var effP2   = price * Math.max(0.5, 1 - (raw * price / liq) * 0.03);
    var eurGot  = raw * effP2;
    setNzHeld(getNzHeld() - raw);
    setEur(getEur() + eurGot);
    setLiq(Math.max(0.01, liq - eurGot * 0.3));
    setVol24(getVol24() + eurGot);
    setPrice(Math.max(0.0000001, effP2 * 0.9985));
    setMcap(getPrice() * getSupply());
    if (getNzHeld() < 0.0001 && localStorage.getItem('nz_holder_reg') === '1') {
      setHolders(Math.max(1, getHolders() - 1));
      localStorage.setItem('nz_holder_reg', '0');
    }
    pushPrice(getPrice());
    pushTx({ type:'sell', eur: eurGot, nz: raw, actor:'You', t: Date.now() });
	recordSell(raw);
    showToast('✅ Vendu ' + raw.toFixed(4) + ' NZ → €' + eurGot.toFixed(4));
  }

  if (inp) inp.value = '';
  checkRefill();
  updateAllUI();
}

/* ── Full UI update ── */
function updateAllUI() {
  var price = getPrice();
  var h     = getPriceHist();
  if (!openAt && h.length) openAt = h[0].p;
  var chg    = openAt ? (price - openAt) / openAt * 100 : 0;
  var chgStr = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';

  setText('nav-price', '€' + price.toFixed(6));
  var nc = el('nav-change');
  if (nc) { nc.textContent = chgStr; nc.className = 'ticker-change' + (chg < 0 ? ' neg' : ''); }

  setText('hero-price',   price.toFixed(6));
  setText('hero-mcap',    '€' + fmt(getMcap()));
  setText('hero-holders', getHolders());
  setText('hero-supply',  fmt(getSupply()));

  setText('stat-price', '€' + price.toFixed(6));
  var sc = el('stat-change');
  if (sc) { sc.textContent = chgStr; sc.style.color = chg >= 0 ? 'var(--green)' : 'var(--red)'; }
  setText('stat-mcap', '€' + fmt(getMcap()));
  setText('stat-vol',  '€' + fmt(getVol24()));
  setText('stat-liq',  '€' + fmt(getLiq()));

  setText('ms-holders',  getHolders());
  setText('ms-bundlers', getBundlers());
  setText('ms-snipers',  getSnipers());
  setText('ms-supply',   fmt(getSupply()) + ' NZ');

  renderWallet();
  if (typeof renderChart === 'function') renderChart();
  renderTxFeed();
  renderHoldersList();
  setText('trade-balance-display', tradeMode === 'buy' ? getEur().toFixed(4) : getNzHeld().toFixed(4));
  updatePreview();
  renderPosition();
}

/* ── Transactions ── */
var FAKE_ADDRS = [
  '0xDEAD…B33F','0x1337…C0DE','0xCAFE…BABE','0xF00D…FEED',
  '0xAB12…9900','0xBEEF…0001','0x0420…6969','0xACE1…FF00',
  '0xDECA…F000','0x9876…5432'
];
function hashCode(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function renderTxFeed() {
  var list = el('tx-list');
  if (!list) return;
  var txs = getTxs();
  if (!txs.length) {
    list.innerHTML = '<div style="color:var(--dim);font-size:12px;padding:6px 0">Aucune transaction</div>';
    return;
  }
  list.innerHTML = txs.slice(0, 20).map(function(tx) {
    var time = new Date(tx.t).toLocaleTimeString('fr-FR');
    var addr = tx.actor === 'You'
      ? '<span style="color:#facc15">🟡 You</span>'
      : '<span class="tx-addr">' + FAKE_ADDRS[hashCode(tx.actor) % FAKE_ADDRS.length] + '</span>';
    return '<div class="tx-row ' + tx.type + '">'
      + '<span class="tx-type">' + tx.type.toUpperCase() + '</span>'
      + '<span>€' + tx.eur.toFixed(4) + '</span>'
      + '<span>' + tx.nz.toFixed(2) + '</span>'
      + '<span class="tx-time">' + time + '</span>'
      + addr
      + '</div>';
  }).join('');
}

function renderHoldersList() {
  var list = el('holders-list');
  if (!list) return;
  var count = Math.max(1, getHolders());
  var pcts  = [23,16,12,9,7,6,5,4,3,2.5];
  var userHolds = getNzHeld() > 0.0001;
  var rows  = FAKE_ADDRS.slice(0, Math.min(10, count)).map(function(addr, i) {
    var p = pcts[i] || 1;
    return '<div class="holder-row">'
      + '<span class="holder-rank">#' + (i+1) + '</span>'
      + '<span class="holder-addr">' + (userHolds && i === 0 ? '🟡 You' : addr) + '</span>'
      + '<span class="holder-pct">' + p.toFixed(1) + '%</span>'
      + '<div class="holder-bar-wrap"><div class="holder-bar" style="width:' + Math.min(100, p*4) + '%"></div></div>'
      + '</div>';
  });
  list.innerHTML = rows.join('');
}
