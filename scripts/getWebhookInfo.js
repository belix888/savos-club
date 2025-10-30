#!/usr/bin/env node
const fetch = require('node-fetch');

(async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || process.env.TG_BOT_TOKEN;
  if (!token) {
    console.error('Set TELEGRAM_BOT_TOKEN environment variable');
    process.exit(1);
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await res.json().catch(() => ({}));
  console.log(JSON.stringify(data, null, 2));
})();


