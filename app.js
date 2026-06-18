const ranges = {
  day: "今日",
  week: "7 日",
  month: "30 日",
};

const LIVE_REFRESH_MS = 2000;
const LIVE_QUOTES_URL = window.location.protocol === "file:" ? "http://127.0.0.1:5184/api/quotes" : "/api/quotes";
const FLASH_MS = 900;

const markets = [
  {
    id: "crypto",
    mapId: "cryptoMap",
    summaryId: "cryptoSummary",
    items: [
      asset("BTC", "Bitcoin", "$64,431.31", 100, 1.8, 5.0, 16.3, "BINANCE:BTCUSDT"),
      asset("ETH", "Ethereum", "$1,747.93", 18, 2.4, 8.6, 18.2, "BINANCE:ETHUSDT"),
      asset("USDT", "Tether", "$0.9991", 14, 0.0, 0.0, 0.0, "CRYPTO:USDTUSD"),
      asset("BNB", "BNB", "$601.13", 8, 0.6, 2.9, 6.7, "BINANCE:BNBUSDT"),
      asset("USDC", "USDC", "$0.9998", 7, 0.0, 0.0, 0.0, "CRYPTO:USDCUSD"),
      asset("XRP", "XRP", "$1.19", 6, 2.6, 8.2, 14.6, "BINANCE:XRPUSDT"),
      asset("SOL", "Solana", "$71.97", 5, 2.1, 15.2, 15.6, "BINANCE:SOLUSDT"),
      asset("TRX", "TRON", "$0.3215", 3, 1.5, 0.1, 9.6, "BINANCE:TRXUSDT"),
      asset("FIGR_HELOC", "Figure Heloc", "$1.02", 1.8, 1.3, 0.3, 1.4, ""),
      asset("STETH", "Lido Staked ETH", "$1,735", 3.5, 2.2, 8.4, 17.8, "BINANCE:STETHUSDT"),
      asset("HYPE", "Hyperliquid", "$71.19", 2.3, 2.9, 33.7, 51.2, "BINANCE:HYPEUSDT"),
      asset("DOGE", "Dogecoin", "$0.165", 3, 1.7, 4.2, 11.6, "BINANCE:DOGEUSDT"),
      asset("USDS", "USDS", "$1.00", 1.6, 0.0, 0.0, 0.0, ""),
      asset("BSC-USD", "BSC USD", "$1.00", 1.3, 0.0, 0.0, 0.0, ""),
      asset("RAIN", "Rain", "$0.0042", 1, 0.8, 2.1, 5.4, ""),
      asset("ADA", "Cardano", "$0.59", 2.5, 1.4, 3.7, 9.1, "BINANCE:ADAUSDT"),
    ],
  },
  {
    id: "us",
    mapId: "usMap",
    summaryId: "usSummary",
    items: [
      asset("NVDA", "NVIDIA", "$204.65", 100, 1.33, 4.8, 15.2, "NASDAQ:NVDA"),
      asset("GOOG", "Alphabet Class C", "$362.10", 62, 2.43, 6.1, 18.6, "NASDAQ:GOOG"),
      asset("GOOGL", "Alphabet Class A", "$361.60", 61, 2.41, 6.0, 18.3, "NASDAQ:GOOGL"),
      asset("AAPL", "Apple", "$295.95", 88, 1.10, 3.4, 9.8, "NASDAQ:AAPL"),
      asset("MSFT", "Microsoft", "$378.91", 92, 3.79, 4.5, 7.2, "NASDAQ:MSFT"),
      asset("AMZN", "Amazon", "$237.50", 58, 3.46, 5.2, 10.1, "NASDAQ:AMZN"),
      asset("SPCX", "SPAC and New Issue ETF", "$191.82", 3, -4.95, 1.2, 3.4, "NASDAQ:SPCX"),
      asset("AVGO", "Broadcom", "$392.90", 39, 4.30, 9.6, 22.4, "NASDAQ:AVGO"),
      asset("TSLA", "Tesla", "$396.38", 31, 2.05, 4.1, 12.6, "NASDAQ:TSLA"),
      asset("META", "Meta Platforms", "$567.58", 43, 5.44, 7.3, 14.0, "NASDAQ:META"),
      asset("MU", "Micron Technology", "$106.40", 8, 2.10, 5.8, 13.2, "NASDAQ:MU"),
      asset("BRK.A", "Berkshire Hathaway Class A", "$736,900", 26, 0.62, 1.7, 4.8, "NYSE:BRK.A"),
      asset("BRK.B", "Berkshire Hathaway Class B", "$511.92", 25, 0.62, 1.7, 4.8, "NYSE:BRK.B"),
      asset("LLY", "Eli Lilly", "$786.50", 22, 1.44, 3.2, 8.9, "NYSE:LLY"),
      asset("WMT", "Walmart", "$102.80", 18, 0.92, 2.4, 6.1, "NYSE:WMT"),
      asset("JPM", "JPMorgan Chase", "$282.63", 17, 0.84, 2.1, 5.1, "NYSE:JPM"),
      asset("AMD", "Advanced Micro Devices", "$158.30", 10, 2.35, 6.2, 15.4, "NASDAQ:AMD"),
    ],
  },
  {
    id: "tw",
    mapId: "twMap",
    summaryId: "twSummary",
    items: [
      asset("2330", "TSMC 台積電", "NT$1,420", 100, 1.48, 3.9, 11.8, "TWSE:2330"),
      asset("2454", "MediaTek 聯發科", "NT$1,380", 10, 1.12, 2.8, 8.4, "TWSE:2454"),
      asset("2308", "Delta 台達電", "NT$680", 8, 0.93, 4.2, 10.6, "TWSE:2308"),
      asset("2317", "Foxconn 鴻海", "NT$267", 5.4, 0.73, 2.1, 5.7, "TWSE:2317"),
      asset("3711", "ASE 日月光投控", "NT$181", 3.7, 1.63, 3.8, 9.2, "TWSE:3711"),
      asset("2327", "Yageo 國巨", "NT$1,065", 3.1, 9.76, 10.9, 21.4, "TWSE:2327"),
      asset("2881", "Fubon 富邦金", "NT$137", 2.7, 2.58, 4.3, 7.8, "TWSE:2881"),
      asset("2303", "United Microelectronics 聯電", "NT$67.8", 2.4, 0.65, 1.8, 6.2, "TWSE:2303"),
      asset("2882", "Cathay Financial 國泰金", "NT$113.5", 2.4, 1.75, 3.6, 6.9, "TWSE:2882"),
      asset("3037", "Unimicron 欣興", "NT$964", 2.2, 1.11, 4.2, 11.3, "TWSE:3037"),
    ],
  },
  {
    id: "metal",
    mapId: "metalMap",
    summaryId: "metalSummary",
    items: [
      asset("GOLD", "黃金 Gold Futures", "$4,318.60", 100, -1.43, 3.90, 4.25, "COMMODITY:GOLD"),
      asset("SILVER", "白銀 Silver Futures", "$68.78", 48, -2.81, 2.80, 6.20, "COMMODITY:SILVER"),
      asset("WTI", "原油 WTI Crude Oil", "$73.75", 62, -2.97, 1.90, 5.40, "COMMODITY:WTI"),
    ],
  },
  {
    id: "usIndex",
    mapId: "usIndexMap",
    summaryId: "usIndexSummary",
    items: [
      asset("S&P 500", "美股標普 500", "$7,420", 100, -1.21, 2.8, 8.6, "INDEX:GSPC"),
      asset("NASDAQ", "美股 Nasdaq Composite", "$26,022", 92, -1.34, 3.4, 10.2, "INDEX:IXIC"),
      asset("DOW", "美股 Dow Jones", "$51,493", 82, -0.98, 1.9, 6.4, "INDEX:DJI"),
    ],
  },
  {
    id: "twIndex",
    mapId: "twIndexMap",
    summaryId: "twIndexSummary",
    items: [
      asset("TAIEX", "台股加權指數", "NT$46,465", 78, 1.28, 3.2, 7.8, "INDEX:TWII"),
      asset("TPEX", "台股櫃買指數", "NT$269.45", 42, 0.65, 2.1, 5.3, "INDEX:TWOII"),
      asset("TW50", "台灣50指數", "NT$42,910", 64, 1.05, 2.8, 7.1, "INDEX:TSE50"),
      asset("Semiconductor", "半導體類股指數", "NT$1,569.20", 54, 1.24, 3.6, 9.4, "INDEX:TWSEMI"),
    ],
  },
];

let activeRange = "day";
let activeSymbol = "";

const searchInput = document.querySelector("#searchInput");
const detailDrawer = document.querySelector("#detailDrawer");
const closeDrawer = document.querySelector("#closeDrawer");
const liveStatus = document.querySelector("#liveStatus");

function asset(symbol, name, price, weight, day, week, month, tvSymbol = "") {
  return { symbol, name, price, weight, tvSymbol, livePrice: null, source: "", updatedAt: "", flash: "", changes: { day, week, month } };
}

function getChange(item) {
  return item.changes[activeRange];
}

function formatChange(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function tileColor(value) {
  if (Math.abs(value) < 0.05) {
    return "linear-gradient(145deg, #8b9298 0%, #777f86 100%)";
  }

  const abs = Math.min(Math.abs(value), 10) / 10;
  const lift = Math.round(abs * 28);

  if (value > 0) {
    return `linear-gradient(145deg, rgb(${40 + lift}, ${150 + lift}, ${82 + lift}) 0%, rgb(${24 + lift}, ${128 + lift}, ${68 + lift}) 100%)`;
  }

  return `linear-gradient(145deg, rgb(${220 + lift}, ${82 + lift}, ${86 + lift}) 0%, rgb(${196 + lift}, ${64 + lift}, ${70 + lift}) 100%)`;
}

function averageChange(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const weighted = items.reduce((sum, item) => sum + getChange(item) * item.weight, 0);
  return weighted / totalWeight;
}

function formatTime(isoTime) {
  if (!isoTime) return "";
  return new Date(isoTime).toLocaleTimeString("zh-TW", { hour12: false });
}

function parseDisplayPrice(priceText) {
  const value = Number(String(priceText).replace(/[^\d.-]/g, ""));
  return Number.isFinite(value) ? value : null;
}

function taiwanMarketStatus(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(values.hour === "24" ? "0" : values.hour);
  const minute = Number(values.minute);
  const minutes = hour * 60 + minute;
  const isWeekday = !["Sat", "Sun"].includes(values.weekday);

  if (!isWeekday || minutes < 9 * 60) return "台股：等待開盤";
  if (minutes <= 13 * 60 + 30) return "台股：盤中";
  return "台股：已收盤";
}

function marketMeta(market) {
  const items = market.items;
  const liveItems = items.filter((item) => item.source && item.updatedAt);
  const status = market.id === "tw" || market.id === "twIndex" ? `${taiwanMarketStatus()} · ` : "";
  if (!liveItems.length) return `${status}市值前 10`;

  const sources = [...new Set(liveItems.map((item) => item.source))].join(" / ");
  const latest = liveItems
    .map((item) => new Date(item.updatedAt).getTime())
    .reduce((max, value) => Math.max(max, value), 0);

  return `${status}${sources} · ${formatTime(new Date(latest).toISOString())}`;
}

function layoutTreemap(items, x, y, width, height) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  return splitItems(sorted, x, y, width, height, total);
}

function layoutMarket(items, width, height) {
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const hero = sorted[0];
  const rest = sorted.slice(1);
  const heroHeight = Math.min(height * 0.44, Math.max(150, height * 0.34));
  const gutter = 0;
  const restHeight = height - heroHeight - gutter;

  return [
    { item: hero, x: 0, y: 0, width, height: heroHeight, hero: true },
    ...layoutTreemap(rest, 0, heroHeight + gutter, width, restHeight).map((tile) => ({ ...tile, hero: false })),
  ];
}

function splitItems(items, x, y, width, height, totalWeight) {
  if (items.length === 0) return [];
  if (items.length === 1) return [{ item: items[0], x, y, width, height }];

  const half = totalWeight / 2;
  let running = 0;
  let splitIndex = 0;

  for (let i = 0; i < items.length; i += 1) {
    const nextRunning = running + items[i].weight;
    const shouldTake = i === 0 || nextRunning <= half || Math.abs(half - nextRunning) < Math.abs(half - running);

    if (!shouldTake) break;

    running = nextRunning;
    splitIndex = i + 1;
  }

  splitIndex = Math.min(Math.max(splitIndex, 1), items.length - 1);

  const first = items.slice(0, splitIndex);
  const second = items.slice(splitIndex);
  const firstWeight = first.reduce((sum, item) => sum + item.weight, 0);
  const secondWeight = totalWeight - firstWeight;

  if (width >= height) {
    const firstWidth = width * (firstWeight / totalWeight);
    return [
      ...splitItems(first, x, y, firstWidth, height, firstWeight),
      ...splitItems(second, x + firstWidth, y, width - firstWidth, height, secondWeight),
    ];
  }

  const firstHeight = height * (firstWeight / totalWeight);
  return [
    ...splitItems(first, x, y, width, firstHeight, firstWeight),
    ...splitItems(second, x, y + firstHeight, width, height - firstHeight, secondWeight),
  ];
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const totalMatches = query
    ? markets.flatMap((market) => market.items).filter((item) => item.symbol.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)).length
    : 0;

  markets.forEach((market) => {
    const map = document.querySelector(`#${market.mapId}`);
    const summary = document.querySelector(`#${market.summaryId}`);
    const meta = summary.closest(".panel-head").querySelector("p");
    const avg = averageChange(market.items);

    summary.textContent = `${ranges[activeRange]} ${formatChange(avg)}`;
    summary.className = avg >= 0 ? "positive" : "negative";
    meta.textContent = marketMeta(market);
    map.innerHTML = "";
    map.classList.add("grid-layout");

    const sortedItems = [...market.items].sort((a, b) => b.weight - a.weight);

    let matchCount = 0;

    sortedItems.forEach((item, index) => {
      const change = getChange(item);
      const isMatch = !query || item.symbol.toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
      if (isMatch) matchCount += 1;
      const hero = index === 0;
      const major = index > 0 && index < 4;
      const isTight = index >= 4;
      const isCompact = index > 8;
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = `tile${hero ? " hero" : ""}${isTight ? " tight" : ""}${isCompact ? " compact" : ""}${item.symbol.length > 6 ? " long-symbol" : ""}${item.flash ? ` flash-${item.flash}` : ""}${isMatch ? "" : " dimmed"}${activeSymbol === item.symbol ? " active" : ""}`;
      tile.style.gridColumn = `span ${hero ? 6 : major ? 3 : 2}`;
      tile.style.gridRow = `span ${hero ? 3 : major ? 2 : 1}`;
      tile.style.background = tileColor(change);
      tile.style.fontSize = hero ? "34px" : major ? "24px" : "16px";
      tile.setAttribute("aria-label", `${item.name} ${item.price} ${formatChange(change)}`);
      tile.innerHTML = `
        <span class="tile-symbol">${item.symbol}</span>
        <span class="tile-price">${item.price}</span>
        <span class="tile-change">${formatChange(change)}</span>
        <span class="tile-name">${item.name}</span>
        <span class="tile-market-note">${item.source || "權重 " + item.weight} · ${ranges[activeRange]}</span>
      `;
      tile.addEventListener("click", () => showDetail(item));
      map.appendChild(tile);
    });

    if (query && totalMatches === 0 && matchCount === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-search";
      empty.textContent = `找不到「${searchInput.value.trim()}」`;
      map.appendChild(empty);
    }
  });
}

function safeRender() {
  try {
    render();
  } catch (error) {
    document.querySelectorAll(".heatmap").forEach((map) => {
      map.innerHTML = `<div class="render-error">熱力圖載入失敗：${error.message}</div>`;
    });
    throw error;
  }
}

function setLiveStatus(message, mode = "") {
  liveStatus.textContent = message;
  liveStatus.className = `live-status${mode ? ` ${mode}` : ""}`;
}

function findAssetByTvSymbol(tvSymbol) {
  for (const market of markets) {
    const match = market.items.find((item) => item.tvSymbol === tvSymbol);
    if (match) return match;
  }
  return null;
}

async function refreshLiveQuotes() {
  try {
    const response = await fetch(`${LIVE_QUOTES_URL}?t=${Date.now()}`, { cache: "no-store" });
    const payload = await response.json();

    if (!payload.quotes.length) {
      throw new Error(payload.error || "報價服務暫時沒有回應");
    }

    payload.quotes.forEach((quote) => {
      const item = findAssetByTvSymbol(quote.tvSymbol);
      if (!item) return;
      const nextPrice = Number(quote.price);
      const previousPrice = item.livePrice;
      const previousDisplayPrice = parseDisplayPrice(item.price);

      if (Number.isFinite(nextPrice) && Number.isFinite(previousPrice) && nextPrice !== previousPrice) {
        item.flash = nextPrice > previousPrice ? "up" : "down";
        setTimeout(() => {
          item.flash = "";
          safeRender();
        }, FLASH_MS);
      }

      if (
        Number.isFinite(nextPrice) &&
        !Number.isFinite(previousPrice) &&
        Number.isFinite(previousDisplayPrice) &&
        nextPrice !== previousDisplayPrice
      ) {
        item.flash = nextPrice > previousDisplayPrice ? "up" : "down";
        setTimeout(() => {
          item.flash = "";
          safeRender();
        }, FLASH_MS);
      }

      if (Number.isFinite(nextPrice)) {
        item.livePrice = nextPrice;
      }

      item.price = quote.priceText;
      item.changes.day = quote.changePercent;
      item.source = quote.source || "";
      item.updatedAt = payload.updatedAt;
    });

    safeRender();
    const time = new Date(payload.updatedAt).toLocaleTimeString("zh-TW", { hour12: false });
    if (payload.ok === false) {
      setLiveStatus(`資料異常 ${time}`, "error");
    } else if (payload.stale) {
      setLiveStatus(`暫存資料 ${time}`, "");
    } else {
      setLiveStatus(`即時 ${time}`, "live");
    }
  } catch (error) {
    const hasLiveData = markets.some((market) => market.items.some((item) => item.updatedAt));
    setLiveStatus(hasLiveData ? "使用目前資料" : "等待報價服務", "");
  }
}

function showDetail(item) {
  activeSymbol = item.symbol;
  const change = getChange(item);

  document.querySelector("#detailName").textContent = item.name;
  document.querySelector("#detailSymbol").textContent = item.symbol;
  document.querySelector("#detailPrice").textContent = item.price;
  document.querySelector("#detailChange").textContent = `${ranges[activeRange]} ${formatChange(change)}`;
  document.querySelector("#detailChange").className = change >= 0 ? "positive" : "negative";
  document.querySelector("#detailWeight").textContent = `權重 ${item.weight}`;
  detailDrawer.classList.add("open");
  safeRender();
}

document.querySelectorAll(".range-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".range-button.active").classList.remove("active");
    button.classList.add("active");
    activeRange = button.dataset.range;
    safeRender();
  });
});

searchInput.addEventListener("input", safeRender);
closeDrawer.addEventListener("click", () => {
  detailDrawer.classList.remove("open");
  activeSymbol = "";
  safeRender();
});

window.addEventListener("resize", safeRender);
window.addEventListener("DOMContentLoaded", safeRender);
window.addEventListener("load", safeRender);
requestAnimationFrame(safeRender);
setTimeout(safeRender, 150);
setTimeout(refreshLiveQuotes, 300);
setInterval(refreshLiveQuotes, LIVE_REFRESH_MS);
