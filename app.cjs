
// --- Simple Express.js server for Railway ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const WOOCOMMERCE_URL = 'https://checkout.whoozer.xyz/wp-json/wc/v3/products';
const CONSUMER_KEY = process.env.WOOCOMMERCE_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_SECRET;

// Endpoint: /api/stock/:productId
app.get('/api/stock/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    // Try to get variations (for variable products)
    const urlVar = `${WOOCOMMERCE_URL}/${productId}/variations?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    const responseVar = await fetch(urlVar);
    const dataVar = await responseVar.json();
    if (Array.isArray(dataVar) && dataVar.length > 0) {
      // Variable product, get stock per size
      const stock = {};
      dataVar.forEach(variation => {
        const sizeAttr = variation.attributes.find(attr => attr.name.toLowerCase() === 'size');
        if (sizeAttr && sizeAttr.option) {
          stock[sizeAttr.option.toUpperCase()] = variation.stock_quantity || 0;
        }
      });
      return res.json(stock);
    } else {
      // Simple product, get stock directly
      const urlSimple = `${WOOCOMMERCE_URL}/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
      const responseSimple = await fetch(urlSimple);
      const dataSimple = await responseSimple.json();
      if (dataSimple && dataSimple.type === 'simple') {
        return res.json({ ALL: dataSimple.stock_quantity || 0 });
      } else {
        return res.status(404).json({ error: 'Produk tidak ditemukan di WooCommerce' });
      }
    }
  } catch (e) {
    res.status(500).json({ error: 'Gagal mengambil stok dari WooCommerce', detail: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('WooCommerce stock API listening on port', PORT);
});
