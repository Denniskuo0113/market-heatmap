#!/usr/bin/env python3
import json
import mimetypes
import os
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "5173"))
BINANCE_SYMBOLS = {
    "BTCUSDT": {"tv_symbol": "BINANCE:BTCUSDT"},
    "ETHUSDT": {"tv_symbol": "BINANCE:ETHUSDT"},
    "BNBUSDT": {"tv_symbol": "BINANCE:BNBUSDT"},
    "XRPUSDT": {"tv_symbol": "BINANCE:XRPUSDT"},
    "SOLUSDT": {"tv_symbol": "BINANCE:SOLUSDT"},
    "TRXUSDT": {"tv_symbol": "BINANCE:TRXUSDT"},
    "WBETHUSDT": {"tv_symbol": "BINANCE:STETHUSDT", "source": "Binance WBETH proxy"},
    "HYPEUSDT": {
        "tv_symbol": "BINANCE:HYPEUSDT",
        "source": "Binance Futures",
        "url": "https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=HYPEUSDT",
    },
    "DOGEUSDT": {"tv_symbol": "BINANCE:DOGEUSDT"},
    "ADAUSDT": {"tv_symbol": "BINANCE:ADAUSDT"},
}
NASDAQ_SYMBOLS = {
    "NVDA": ("NASDAQ:NVDA", "stocks"),
    "GOOG": ("NASDAQ:GOOG", "stocks"),
    "GOOGL": ("NASDAQ:GOOGL", "stocks"),
    "AAPL": ("NASDAQ:AAPL", "stocks"),
    "MSFT": ("NASDAQ:MSFT", "stocks"),
    "AMZN": ("NASDAQ:AMZN", "stocks"),
    "SPCX": ("NASDAQ:SPCX", "stocks"),
    "AVGO": ("NASDAQ:AVGO", "stocks"),
    "TSLA": ("NASDAQ:TSLA", "stocks"),
    "META": ("NASDAQ:META", "stocks"),
    "MU": ("NASDAQ:MU", "stocks"),
    "BRK.A": ("NYSE:BRK.A", "stocks", "BRK.A"),
    "BRK.B": ("NYSE:BRK.B", "stocks", "BRK.B"),
    "LLY": ("NYSE:LLY", "stocks"),
    "WMT": ("NYSE:WMT", "stocks"),
    "JPM": ("NYSE:JPM", "stocks"),
    "AMD": ("NASDAQ:AMD", "stocks"),
}
COMMODITY_SYMBOLS = {
    "GC=F": {"tv_symbol": "COMMODITY:GOLD", "name": "Gold Futures"},
    "SI=F": {"tv_symbol": "COMMODITY:SILVER", "name": "Silver Futures"},
    "CL=F": {"tv_symbol": "COMMODITY:WTI", "name": "WTI Crude Oil Futures"},
}
INDEX_SYMBOLS = {
    "^GSPC": {"tv_symbol": "INDEX:GSPC", "name": "S&P 500"},
    "^IXIC": {"tv_symbol": "INDEX:IXIC", "name": "Nasdaq Composite"},
    "^DJI": {"tv_symbol": "INDEX:DJI", "name": "Dow Jones"},
    "^TSE50": {"tv_symbol": "INDEX:TSE50", "name": "FTSE TWSE Taiwan 50"},
}
TWSE_SYMBOLS = {
    "2330": "TWSE:2330",
    "2454": "TWSE:2454",
    "2308": "TWSE:2308",
    "2317": "TWSE:2317",
    "3711": "TWSE:3711",
    "2327": "TWSE:2327",
    "2881": "TWSE:2881",
    "2303": "TWSE:2303",
    "2882": "TWSE:2882",
    "3037": "TWSE:3037",
}
TWSE_INDEX_CHANNELS = {
    "tse_t00.tw": {"code": "t00", "tv_symbol": "INDEX:TWII", "source": "TWSE Index"},
    "otc_o00.tw": {"code": "o00", "tv_symbol": "INDEX:TWOII", "source": "TWSE Index"},
    "tse_t24.tw": {"code": "t24", "tv_symbol": "INDEX:TWSEMI", "source": "TWSE Index"},
}
LAST_SUCCESS = None
LAST_FETCHED_AT = 0
CACHE_TTL_SECONDS = 2
SOURCE_CACHE = {
    "Binance": {"quotes": [], "updated_at": 0, "ttl": 2},
    "TWSE": {"quotes": [], "updated_at": 0, "ttl": 5},
    "Nasdaq": {"quotes": [], "updated_at": 0, "ttl": 30},
    "Yahoo": {"quotes": [], "updated_at": 0, "ttl": 15},
}


def format_price(value, currency):
    if value is None:
        return "--"

    prefix = "NT$" if currency == "TWD" else "$"
    if abs(value) >= 1000:
        return f"{prefix}{value:,.0f}"
    if abs(value) >= 100:
        return f"{prefix}{value:,.2f}"
    if abs(value) >= 1:
        return f"{prefix}{value:,.3f}".rstrip("0").rstrip(".")
    return f"{prefix}{value:.6f}".rstrip("0").rstrip(".")


def parse_number(value):
    if value in (None, "", "-", "N/A"):
        return None
    return float(str(value).replace("$", "").replace("%", "").replace(",", "").strip())


def fetch_json(url, headers=None, timeout=8, verify_tls=True):
    request = urllib.request.Request(
        url,
        headers=headers
        or {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )
    context = None if verify_tls else ssl._create_unverified_context()
    with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_binance_quotes():
    quotes = [
        {
            "tvSymbol": "CRYPTO:USDTUSD",
            "price": 1,
            "priceText": "$1.00",
            "changePercent": 0,
            "changeAbs": 0,
            "currency": "USD",
            "source": "Binance",
        },
        {
            "tvSymbol": "CRYPTO:USDCUSD",
            "price": 1,
            "priceText": "$1.00",
            "changePercent": 0,
            "changeAbs": 0,
            "currency": "USD",
            "source": "Binance",
        },
    ]

    for symbol, config in BINANCE_SYMBOLS.items():
        try:
            url = config.get("url") or f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
            row = fetch_json(url, timeout=4)
        except Exception:
            continue

        tv_symbol = config["tv_symbol"]
        price = parse_number(row.get("lastPrice"))
        if not tv_symbol or price is None:
            continue
        quotes.append(
            {
                "tvSymbol": tv_symbol,
                "price": price,
                "priceText": format_price(price, "USD"),
                "changePercent": parse_number(row.get("priceChangePercent")) or 0,
                "changeAbs": parse_number(row.get("priceChange")) or 0,
                "currency": "USD",
                "source": config.get("source", "Binance"),
            }
        )
    return quotes


def fetch_twse_quotes():
    stock_channels = [f"tse_{symbol}.tw" for symbol in TWSE_SYMBOLS]
    index_channels = list(TWSE_INDEX_CHANNELS)
    index_symbols = {config["code"]: config for config in TWSE_INDEX_CHANNELS.values()}
    channels = "|".join(stock_channels + index_channels)
    url = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?" + urllib.parse.urlencode(
        {"ex_ch": channels, "json": "1", "delay": "0"},
        safe="|",
    )
    data = fetch_json(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Referer": "https://mis.twse.com.tw/stock/index.jsp",
        },
        timeout=6,
        verify_tls=False,
    )

    quotes = []
    for row in data.get("msgArray", []):
        code = row.get("c")
        index_config = index_symbols.get(code)
        tv_symbol = TWSE_SYMBOLS.get(code) or (index_config or {}).get("tv_symbol")
        price = parse_number(row.get("z"))
        prev_close = parse_number(row.get("y"))
        if not tv_symbol or price is None:
            continue
        change_abs = price - prev_close if prev_close else 0
        change_percent = (change_abs / prev_close * 100) if prev_close else 0

        quotes.append(
            {
                "tvSymbol": tv_symbol,
                "price": price,
                "priceText": format_price(price, "TWD"),
                "changePercent": change_percent,
                "changeAbs": change_abs,
                "currency": "TWD",
                "source": (index_config or {}).get("source", "TWSE"),
            }
        )
    return quotes


def fetch_nasdaq_one(symbol, asset_class):
    config = NASDAQ_SYMBOLS[symbol]
    api_symbol = config[2] if len(config) > 2 else symbol.replace(".", "-")
    url = f"https://api.nasdaq.com/api/quote/{urllib.parse.quote(api_symbol)}/info?assetclass={asset_class}"
    data = fetch_json(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Referer": "https://www.nasdaq.com/",
        },
        timeout=8,
    )
    primary = (data.get("data") or {}).get("primaryData") or {}
    price = parse_number(primary.get("lastSalePrice"))
    if price is None:
        return None
    tv_symbol = config[0]
    return {
        "tvSymbol": tv_symbol,
        "price": price,
        "priceText": format_price(price, "USD"),
        "changePercent": parse_number(primary.get("percentageChange")) or 0,
        "changeAbs": parse_number(primary.get("netChange")) or 0,
        "currency": "USD",
        "source": "Nasdaq",
    }


def fetch_nasdaq_quotes():
    quotes = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {
            executor.submit(fetch_nasdaq_one, symbol, asset_class)
            for symbol, (tv_symbol, asset_class, *rest) in NASDAQ_SYMBOLS.items()
        }
        for future in as_completed(futures):
            try:
                quote = future.result()
            except Exception:
                continue
            if quote:
                quotes.append(quote)
    return quotes


def fetch_yahoo_commodity_one(symbol, config):
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        + urllib.parse.quote(symbol, safe="")
        + "?range=1d&interval=1m"
    )
    data = fetch_json(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
        timeout=8,
    )
    result = ((data.get("chart") or {}).get("result") or [{}])[0]
    meta = result.get("meta") or {}
    price = parse_number(meta.get("regularMarketPrice"))
    previous_close = parse_number(meta.get("chartPreviousClose") or meta.get("previousClose"))
    if price is None:
        return None

    change_abs = price - previous_close if previous_close else 0
    change_percent = (change_abs / previous_close * 100) if previous_close else 0
    currency = meta.get("currency") or "USD"
    return {
        "tvSymbol": config["tv_symbol"],
        "price": price,
        "priceText": format_price(price, currency),
        "changePercent": change_percent,
        "changeAbs": change_abs,
        "currency": currency,
        "source": "Yahoo Finance",
    }


def fetch_yahoo_commodity_quotes():
    quotes = []
    yahoo_symbols = {**COMMODITY_SYMBOLS, **INDEX_SYMBOLS}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(fetch_yahoo_commodity_one, symbol, config)
            for symbol, config in yahoo_symbols.items()
        }
        for future in as_completed(futures):
            try:
                quote = future.result()
            except Exception:
                continue
            if quote:
                quotes.append(quote)
    return quotes


def fetch_all_sources():
    now = time.time()
    errors = []

    fetchers = {
        "Binance": fetch_binance_quotes,
        "TWSE": fetch_twse_quotes,
        "Nasdaq": fetch_nasdaq_quotes,
        "Yahoo": fetch_yahoo_commodity_quotes,
    }
    due_sources = [
        source
        for source, cache in SOURCE_CACHE.items()
        if not cache["quotes"] or now - cache["updated_at"] >= cache["ttl"]
    ]

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(fetchers[source]): source for source in due_sources}
        for future in as_completed(futures):
            source = futures[future]
            try:
                SOURCE_CACHE[source]["quotes"] = future.result()
                SOURCE_CACHE[source]["updated_at"] = now
            except Exception as error:
                errors.append(f"{source}: {error}")

    quotes = []
    for cache in SOURCE_CACHE.values():
        quotes.extend(cache["quotes"])
    return quotes, errors


def fetch_quotes():
    global LAST_SUCCESS, LAST_FETCHED_AT

    now = time.time()
    if LAST_SUCCESS and now - LAST_FETCHED_AT < CACHE_TTL_SECONDS:
        cached = dict(LAST_SUCCESS)
        cached["cached"] = True
        return cached

    quotes, errors = fetch_all_sources()

    if not quotes:
        raise RuntimeError("; ".join(errors) or "No provider returned quotes")

    payload = {
        "ok": True,
        "source": "Binance + TWSE + Nasdaq",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "quoteCount": len(quotes),
        "quotes": quotes,
        "warnings": errors,
    }
    LAST_SUCCESS = payload
    LAST_FETCHED_AT = now
    return payload


class HeatmapHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/api/quotes"):
            self.handle_quotes()
            return

        if self.path == "/":
            self.path = "/index.html"

        super().do_GET()

    def handle_quotes(self):
        global LAST_SUCCESS

        try:
            payload = fetch_quotes()
        except Exception as error:
            if LAST_SUCCESS:
                payload = dict(LAST_SUCCESS)
                payload["ok"] = True
                payload["stale"] = True
                payload["error"] = str(error)
                payload["updatedAt"] = datetime.now(timezone.utc).isoformat()
            else:
                payload = {
                    "ok": False,
                    "source": "Binance + TWSE + Nasdaq",
                    "updatedAt": datetime.now(timezone.utc).isoformat(),
                    "error": str(error),
                    "quotes": [],
                }

        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def guess_type(self, path):
        guessed, encoding = mimetypes.guess_type(path)
        if guessed:
            return guessed
        return super().guess_type(path)


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer((HOST, PORT), HeatmapHandler)
    print(f"Serving market heatmap at http://{HOST}:{PORT}/index.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
