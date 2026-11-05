var adminAuthed = false;

function openAdmin() {
  el('admin-overlay').classList.remove('hidden');
  if (!adminAuthed) {
    el('admin-login').classList.remove('hidden');
    el('admin-controls').classList.add('hidden');
    setTimeout(function() { el('admin-pwd').focus(); }, 100);
  }
}

function closeAdmin() {
  el('admin-overlay').classList.add('hidden');
  el('admin-pwd').value = '';
  el('admin-error').classList.add('hidden');
}

function adminLogin() {
  if (el('admin-pwd').value === NEZO.adminPassword) {
    adminAuthed = true;
    el('admin-login').classList.add('hidden');
    el('admin-controls').classList.remove('hidden');
    el('admin-error').classList.add('hidden');
  } else {
    el('admin-error').classList.remove('hidden');
    el('admin-pwd').value = '';
    el('admin-pwd').focus();
  }
}

function adminAnnounce() {
  var msg = el('admin-announcement').value.trim();
  if (!msg) return;
  el('announcement-text').textContent = '📢 ' + msg;
  el('announcement-banner').classList.remove('hidden');
  el('admin-announcement').value = '';
  setTimeout(function() { el('announcement-banner').classList.add('hidden'); }, 30000);
  showToast('Annonce envoyée ✅');
}

function adminAddLiq() {
  var v = parseFloat(el('admin-add-liq').value) || 0;
  if (v <= 0) return;
  setLiq(getLiq() + v);
  el('admin-add-liq').value = '';
  updateAllUI();
  showToast('+€' + v.toFixed(2) + ' liquidité 💧');
}

function adminAddVol() {
  var v = parseFloat(el('admin-add-vol').value) || 0;
  if (v <= 0) return;
  setVol24(getVol24() + v);
  el('admin-add-vol').value = '';
  updateAllUI();
  showToast('+€' + v.toFixed(2) + ' volume 📊');
}

function adminAddHolders() {
  var v = parseInt(el('admin-add-holders').value) || 0;
  if (v <= 0) return;
  setHolders(getHolders() + v);
  el('admin-add-holders').value = '';
  updateAllUI();
  showToast('+' + v + ' holders 👥');
}

function adminAddBundlers() {
  var v = parseInt(el('admin-add-bundlers').value) || 0;
  if (v <= 0) return;
  setBundlers(getBundlers() + v);
  el('admin-add-bundlers').value = '';
  updateAllUI();
  showToast('+' + v + ' bundlers 🤖');
}

function adminSetMcap() {
  var v = parseFloat(el('admin-set-mcap').value) || 0;
  if (v <= 0) return;
  var newPrice = v / getSupply();
  setPrice(newPrice);
  setMcap(v);
  pushPrice(newPrice);
  el('admin-set-mcap').value = '';
  updateAllUI();
  showToast('Market cap → €' + fmt(v) + ' 💰');
}

function adminSetPrice() {
  var v = parseFloat(el('admin-set-price').value) || 0;
  if (v <= 0) return;
  setPrice(v);
  setMcap(v * getSupply());
  pushPrice(v);
  el('admin-set-price').value = '';
  updateAllUI();
  showToast('Prix → €' + v + ' 🏷');
}

function adminRugPull() {
  if (!confirm('💀 RUG PULL — retirer toute la liquidité et crasher le prix ?')) return;
  var steps = [0.55, 0.40, 0.28, 0.18, 0.08];
  var delay = 0;
  steps.forEach(function(mult) {
    setTimeout(function() {
      setPrice(getPrice() * mult);
      setMcap(getPrice() * getSupply());
      setLiq(getLiq() * 0.1);
      pushPrice(getPrice());
      updateAllUI();
    }, delay);
    delay += 350;
  });
  setTimeout(function() {
    setLiq(0);
    updateAllUI();
    showToast('💀 RUG PULL EXÉCUTÉ', 5000);
  }, delay);
}
