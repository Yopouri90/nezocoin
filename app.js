document.addEventListener('DOMContentLoaded', function() {

  /* Live preview on amount input */
  var amtInput = el('trade-amount');
  if (amtInput) {
    amtInput.addEventListener('input', updatePreview);
    amtInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') executeTrade();
    });
  }

  /* Close admin on overlay backdrop click */
  var overlay = el('admin-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeAdmin();
    });
  }

  /* Enter on admin password field */
  var pwdInput = el('admin-pwd');
  if (pwdInput) {
    pwdInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') adminLogin();
    });
  }

  /* Smooth scroll for hero buttons */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* Boot sequence */
  initWallet();
  initMarket();
  renderHeroCoin();
  initChart();
  initFactory();
  initBots();
  setTradeMode('buy');

  console.log('[NezoCoin] ⚡ NZ to the moon 🚀');
});
