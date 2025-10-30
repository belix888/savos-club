Telegram Webhook Setup

1) Set environment variables on the hosting platform
- TELEGRAM_BOT_TOKEN: your Telegram bot token
- WEBSITE_URL: e.g. https://savos-club-two.vercel.app

2) Deploy the site (the API exposes POST /webhook).

3) Set webhook
```
npm run webhook:set
```
This calls https://api.telegram.org/bot<TOKEN>/setWebhook with URL <WEBSITE_URL>/webhook

4) Check webhook status
```
npm run webhook:get
```

5) Remove webhook (optional)
```
npm run webhook:delete
```

After step 3, sending /start to the bot will reply with a button to open the mini‑app.

