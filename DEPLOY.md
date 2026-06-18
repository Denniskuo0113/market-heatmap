# 市場熱力圖部署筆記

## 推薦方式：Render Web Service

這個網站需要同時提供靜態頁面和 `/api/quotes`，所以請用 Web Service，不要只用 Static Site。

Render 設定：

- Runtime: Python
- Build Command: `python3 -m py_compile server.py`
- Start Command: `python3 server.py`
- Environment Variable: `HOST=0.0.0.0`

部署完成後，Render 會提供一個公開網址，例如：

`https://market-heatmap.onrender.com`

## 上線後檢查

- 開啟 `/index.html`
- 開啟 `/api/quotes`
- 確認六個區域都有資料
- 確認畫面沒有顯示連線中斷或載入失敗

## 長期正式分享

先使用 Render 提供的公開網址測試。確認穩定後，再購買 `.com` 或 `.tw` 網域並綁定到 Render。
