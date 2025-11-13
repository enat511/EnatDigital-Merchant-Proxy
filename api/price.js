import fetch from 'node-fetch';

export default async function handler(req, res) {
  const symbol = (req.query.symbol || '').toUpperCase();
  if (!symbol) return res.status(400).json({ price: null, error: 'No symbol provided' });

  try {
    // Fetch Bitget ticker
    const bitgetResp = await fetch(`https://api.bitget.com/api/spot/market/tickers?symbol=${symbol}`);
    const data = await bitgetResp.json();

    let lastPrice = null;
    if (data?.data && data.data.length > 0) lastPrice = parseFloat(data.data[0].lastPr);

    // Fallback NGN rate
    let usdtToNgn = 1700;

    if (!lastPrice) return res.status(500).json({ price: null, error: 'Bitget price unavailable' });

    // Merchant margins
    const buyPct = 1.5;
    const sellPct = 1.0;

    const marketNgn = lastPrice * usdtToNgn;
    const buyRate = marketNgn * (1 + buyPct / 100);
    const sellRate = marketNgn * (1 - sellPct / 100);

    res.status(200).json({ market: marketNgn, buy: buyRate, sell: sellRate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ price: null, error: 'Fetch error' });
  }
}
