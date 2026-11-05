var botState = {};

var BOT_PROFILES = [
  { name:'whale_1',      type:'whale',        dMin:90000,  dMax:250000 },
  { name:'whale_2',      type:'whale',        dMin:120000, dMax:300000 },
  { name:'panic_1',      type:'weakHand',     dMin:8000,   dMax:25000  },
  { name:'panic_2',      type:'weakHand',     dMin:10000,  dMax:30000  },
  { name:'panic_3',      type:'weakHand',     dMin:6000,   dMax:20000  },
  { name:'dip_1',        type:'dipBuyer',     dMin:20000,  dMax:60000  },
  { name:'dip_2',        type:'dipBuyer',     dMin:25000,  dMax:80000  },
  { name:'fomo_1',       type:'fomo',         dMin:5000,   dMax:15000  },
  { name:'fomo_2',       type:'fomo',         dMin:7000,   dMax:20000  },
  { name:'fomo_3',       type:'fomo',         dMin:4000,   dMax:12000  },
  { name:'scalp_1',      type:'scalper',      dMin:3000,   dMax:9000   },
  { name:'scalp_2',      type:'scalper',      dMin:4000,   dMax:11000  },
  { name:'diamond_1',    type:'diamond',      dMin:60000,  dMax:180000 },
  { name:'diamond_2',    type:'diamond',      dMin:80000,  dMax:220000 },
  { name:'daytrader_1',  type:'dayTrader',    dMin:12000,  dMax:40000  },
  { name:'daytrader_2',  type:'dayTrader',    dMin:15000,  dMax:45000  },
  { name:'bearwhale',    type:'bearWhale',    dMin:150000, dMax:400000 },
  { name:'bot_random_1', type:'random',       dMin:5000,   dMax:30000  },
  { name:'bot_random_2', type:'random',       dMin:8000,   dMax:35000  },
  { name:'bot_random_3', type:'random',       dMin:6000,   dMax:28000  },
];

/* Prix récent pour détecter tendance */
function recentPriceChange(seconds) {
  var hist   = getPriceHist();
  var now    = Date.now();
  var cutoff = now - seconds * 1000;
  var recent = hist.filter(function(p) { return p.t >= cutoff; });
  if (recent.length < 2) return 0;
  var oldest = recent[0].p;
  var latest = recent[recent.length - 1].p;
  return (latest - oldest) / oldest;
}

function initBots() {
  BOT_PROFILES.forEach(function(profile) {
    botState[profile.name] = {
      nz:        Math.random() * 30,
      entryPrice: getPrice(),
      buys:      0
    };
    scheduleBot(profile);
  });
}

function scheduleBot(profile) {
  var delay = profile.dMin + Math.random() * (profile.dMax - profile.dMin);
  setTimeout(function() {
    botTrade(profile);
    scheduleBot(profile);
  }, delay);
}

function botBuy(name, eurAmt) {
  var price = getPrice();
  var liq   = Math.max(0.05, getLiq());
  var effP  = price * (1 + (eurAmt / liq) * 0.025);
  var nzGot = eurAmt / effP;
  var state = botState[name];
  /* prix d'entrée moyen pondéré */
  var totalNz  = state.nz + nzGot;
  state.entryPrice = totalNz > 0
    ? (state.nz * state.entryPrice + nzGot * effP) / totalNz
    : effP;
  state.nz   = totalNz;
  state.buys = (state.buys || 0) + 1;
  setLiq(liq + eurAmt * 0.5);
  setVol24(getVol24() + eurAmt);
  setPrice(effP * 1.0012);
  setMcap(getPrice() * getSupply());
  if (Math.random() < 0.06) setHolders(getHolders() + 1);
  pushPrice(getPrice());
  pushTx({ type:'buy', eur: eurAmt, nz: nzGot, actor: name, t: Date.now() });
  updateAllUI();
}

function botSell(name, nzAmt) {
  var price = getPrice();
  var liq   = Math.max(0.05, getLiq());
  if (nzAmt < 0.001) return;
  var effP   = price * Math.max(0.4, 1 - (nzAmt * price / liq) * 0.025);
  var eurGot = nzAmt * effP;
  var state  = botState[name];
  state.nz   = Math.max(0, state.nz - nzAmt);
  if (state.nz < 0.001) { state.entryPrice = 0; state.buys = 0; }
  setLiq(Math.max(0.05, getLiq() - eurGot * 0.3));
  setVol24(getVol24() + eurGot);
  setPrice(Math.max(0.0000001, effP * 0.9988));
  setMcap(getPrice() * getSupply());
  pushPrice(getPrice());
  pushTx({ type:'sell', eur: eurGot, nz: nzAmt, actor: name, t: Date.now() });
  updateAllUI();
}

function botTrade(profile) {
  var state     = botState[profile.name];
  var price     = getPrice();
  var chg60s    = recentPriceChange(60);   /* variation dernière minute */
  var chg300s   = recentPriceChange(300);  /* variation 5 dernières min */
  var pnl       = state.entryPrice > 0 ? (price - state.entryPrice) / state.entryPrice : 0;

  switch (profile.type) {

    /* ── WHALE : gros achats rares, dump partiel brutal ── */
    case 'whale': {
      if (state.nz < 1 && Math.random() < 0.7) {
        /* accumulation */
        botBuy(profile.name, 3 + Math.random() * 8);
      } else if (state.nz > 5) {
        if (pnl > 0.3 && Math.random() < 0.5) {
          /* take profit partiel */
          botSell(profile.name, state.nz * (0.3 + Math.random() * 0.4));
        } else if (pnl < -0.2 && Math.random() < 0.4) {
          /* stop loss */
          botSell(profile.name, state.nz * 0.8);
        }
      }
      break;
    }

    /* ── BEAR WHALE : vend gros, achète peu ── */
    case 'bearWhale': {
      if (state.nz < 2) {
        if (Math.random() < 0.3) botBuy(profile.name, 1 + Math.random() * 3);
      } else {
        /* dump si prix a monté */
        if (chg300s > 0.05 && Math.random() < 0.7) {
          botSell(profile.name, state.nz * (0.5 + Math.random() * 0.5));
        } else if (Math.random() < 0.4) {
          botSell(profile.name, state.nz * (0.2 + Math.random() * 0.3));
        }
      }
      break;
    }

    /* ── WEAK HAND : panic sell si ça baisse, FOMO si ça monte ── */
    case 'weakHand': {
      if (chg60s < -0.04 && state.nz > 0.1) {
        /* PANIC SELL — vend tout d'un coup */
        var panicAmt = state.nz * (0.7 + Math.random() * 0.3);
        botSell(profile.name, panicAmt);
        /* déclenche un effet cascade : schedule un autre weak hand */
        setTimeout(function() {
          var other = BOT_PROFILES.filter(function(p) { return p.type === 'weakHand'; });
          var pick  = other[Math.floor(Math.random() * other.length)];
          if (pick && botState[pick.name].nz > 0.1) {
            botSell(pick.name, botState[pick.name].nz * (0.5 + Math.random() * 0.4));
          }
        }, 1500 + Math.random() * 3000);
      } else if (chg60s > 0.03 && state.nz < 0.5) {
        /* petit achat FOMO */
        botBuy(profile.name, 0.2 + Math.random() * 0.8);
      } else if (pnl < -0.15 && state.nz > 0.1) {
        /* stop loss automatique */
        botSell(profile.name, state.nz);
      }
      break;
    }

    /* ── DIP BUYER : attend une baisse pour rentrer ── */
    case 'dipBuyer': {
      if (chg300s < -0.08 && Math.random() < 0.75) {
        /* dip détecté → achat */
        botBuy(profile.name, 0.5 + Math.random() * 2);
      } else if (pnl > 0.4 && state.nz > 0 && Math.random() < 0.5) {
        /* take profit */
        botSell(profile.name, state.nz * (0.4 + Math.random() * 0.4));
      } else if (state.nz < 0.1 && chg300s < -0.03 && Math.random() < 0.4) {
        botBuy(profile.name, 0.3 + Math.random() * 1);
      }
      break;
    }

    /* ── FOMO : rush à l'achat si ça monte ── */
    case 'fomo': {
      if (chg60s > 0.025 && Math.random() < 0.8) {
        /* pump détecté → FOMO buy */
        botBuy(profile.name, 0.3 + Math.random() * 1.5);
        /* déclenche d'autres FOMO en cascade */
        setTimeout(function() {
          var others = BOT_PROFILES.filter(function(p) { return p.type === 'fomo'; });
          others.forEach(function(p) {
            if (p.name !== profile.name && Math.random() < 0.5) {
              setTimeout(function() {
                botBuy(p.name, 0.2 + Math.random() * 0.8);
              }, Math.random() * 4000);
            }
          });
        }, 500);
      } else if (pnl < -0.12 && state.nz > 0 && Math.random() < 0.6) {
        /* panic cut */
        botSell(profile.name, state.nz * 0.9);
      }
      break;
    }

    /* ── SCALPER : petits trades fréquents, +/-2% ── */
    case 'scalper': {
      if (state.nz < 0.5) {
        botBuy(profile.name, 0.1 + Math.random() * 0.4);
      } else if (pnl > 0.02) {
        botSell(profile.name, state.nz * (0.5 + Math.random() * 0.4));
      } else if (pnl < -0.02) {
        botSell(profile.name, state.nz * 0.8);
      } else if (Math.random() < 0.5) {
        botBuy(profile.name, 0.1 + Math.random() * 0.3);
      }
      break;
    }

    /* ── DIAMOND HANDS : achète une fois, ne vend quasi jamais ── */
    case 'diamond': {
      if (state.buys === 0 || state.nz < 0.1) {
        botBuy(profile.name, 1 + Math.random() * 4);
      } else if (pnl > 2.0 && Math.random() < 0.1) {
        /* vend seulement si x3 */
        botSell(profile.name, state.nz * 0.3);
      }
      break;
    }

    /* ── DAY TRADER : suit la tendance ── */
    case 'dayTrader': {
      if (chg300s > 0.02 && state.nz < 1 && Math.random() < 0.7) {
        botBuy(profile.name, 0.3 + Math.random() * 1);
      } else if (chg300s < -0.02 && state.nz > 0 && Math.random() < 0.7) {
        botSell(profile.name, state.nz * (0.4 + Math.random() * 0.4));
      } else if (pnl > 0.08 && Math.random() < 0.5) {
        botSell(profile.name, state.nz * 0.5);
      } else if (Math.random() < 0.3) {
        botBuy(profile.name, 0.2 + Math.random() * 0.6);
      }
      break;
    }

    /* ── RANDOM : imprévisible ── */
    case 'random':
    default: {
      if (Math.random() < 0.5) {
        botBuy(profile.name, 0.1 + Math.random() * 1);
      } else if (state.nz > 0.1) {
        botSell(profile.name, state.nz * (0.2 + Math.random() * 0.6));
      }
      break;
    }
  }
}