/**
 * Slack Notifier
 * Sends a message to Slack via Incoming Webhook
 *
 * Usage:
 *   node scripts/slack_notify.js "Optional custom message"
 */

const https = require("https");

const webhookUrl = process.env.SLACK_WEBHOOK_URL; // store in .env
if (!webhookUrl) {
  console.error("❌ Missing SLACK_WEBHOOK_URL in environment variables.");
  process.exit(1);
}

const message = process.argv[2] || "✅ MCP Health check passed — Shieldmate system is online.";

// Build payload
const payload = JSON.stringify({ text: message });

// Parse webhook URL
const url = new URL(webhookUrl);

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload)
  }
};

// Send request
const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log("✅ Slack notification sent:", message);
  } else {
    console.error(`❌ Failed with status: ${res.statusCode}`);
  }
});

req.on("error", (e) => {
  console.error("❌ Error sending to Slack:", e);
});

req.write(payload);
req.end();
