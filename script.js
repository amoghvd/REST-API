const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'blockchainData.json');

const server = http.createServer((req, res) => {
  // Enable CORS and JSON response header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Load fresh data from JSON file on every request
  let blockchainData;
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    blockchainData = JSON.parse(rawData);
  } catch (err) {
    res.writeHead(500);
    return res.end(JSON.stringify({ success: false, error: 'Failed to load data' }));
  }

  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  if (pathname === '/api/blocks') {
    let blocks = blockchainData.blocks || [];
    if (query.number) {
      blocks = blocks.filter(b => b.number == query.number);
    }
    if (query.miner) {
      blocks = blocks.filter(b => b.miner.toLowerCase() === query.miner.toLowerCase());
    }
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, data: blocks }));
  }

  if (pathname === '/api/transactions') {
    let txs = blockchainData.transactions || [];
    if (query.block) {
      txs = txs.filter(t => t.block == query.block);
    }
    if (query.from) {
      txs = txs.filter(t => t.from.toLowerCase() === query.from.toLowerCase());
    }
    if (query.to) {
      txs = txs.filter(t => t.to.toLowerCase() === query.to.toLowerCase());
    }
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, data: txs }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ success: false, error: 'Not Found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/`);
});