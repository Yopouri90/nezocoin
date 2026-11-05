var USER_ID = null;

function initWallet() {
  USER_ID = localStorage.getItem('nz_uid');
  if (!USER_ID) {
    USER_ID = 'u_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('nz_uid', USER_ID);
  }
  if (localStorage.getItem('nz_eur') === null) localStorage.setItem('nz_eur', NEZO.START_BALANCE.toString());
  if (localStorage.getItem('nz_nz')  === null) localStorage.setItem('nz_nz',  '0');
}

function getEur()     { return parseFloat(localStorage.getItem('nz_eur') || '0'); }
function getNzHeld()  { return parseFloat(localStorage.getItem('nz_nz')  || '0'); }
function setEur(v)    { localStorage.setItem('nz_eur', Math.max(0, v).toFixed(8)); }
function setNzHeld(v) { localStorage.setItem('nz_nz',  Math.max(0, v).toFixed(8)); }

function checkRefill() {
  if (getEur() < 0.0001 && getNzHeld() < 0.0001) {
    setEur(NEZO.START_BALANCE);
    showToast('Wallet vide — rechargement de €10 🔄');
    renderWallet();
  }
}

function renderWallet() {
  var nz    = getNzHeld();
  var price = getPrice();
  setText('wallet-nz',      nz.toFixed(4));
  setText('wallet-eur',     (nz * price).toFixed(4));
  setText('wallet-eur-bal', getEur().toFixed(2));
}
