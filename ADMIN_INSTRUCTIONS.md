# Admin Access Instructions

## How to change your Admin Password

Run this command in your terminal:

```bash
npm run admin:password 'YOUR_NEW_PASSWORD'
```

## How to change your Admin PIN

1. Open the `.env` file.
2. Change the `ADMIN_ACCESS_PIN` value.
3. Restart the server.

---

*Note: After changing the password via the command, always restart your server (`npm run dev`) to apply the changes.*

# **while local testing payment need to use this command**

stripe listen --forward-to localhost:3000/api/webhooks/stripe
