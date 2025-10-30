#!/usr/bin/env node
const fetch = require('node-fetch');

(async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || process.env.TG_BOT_TOKEN;
  const site = process.env.WEBSITE_URL || 'https://savos-club-two.vercel.app';
  const url = `${site.replace(/\/$/, '')}/webhook`;
  if (!token) {
    console.error('Set TELEGRAM_BOT_TOKEN environment variable');
    process.exit(1);
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url })
  });
  const data = await res.json().catch(() => ({}));
  console.log(JSON.stringify(data, null, 2));
})();


