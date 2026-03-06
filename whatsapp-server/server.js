const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, 'messages.json');

// Initialize local DB if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// Webhook Verification (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook Receiver (POST)
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from;
            const msgBody = message.text ? message.text.body : '[System/Media Message]';
            const name = body.entry[0].changes[0].value.contacts[0].profile.name;

            const newMessage = {
                id: message.id,
                from: from,
                name: name,
                text: msgBody,
                timestamp: new Date().toISOString(),
                direction: 'inbound'
            };

            // Save to messages.json
            const db = JSON.parse(fs.readFileSync(DB_PATH));
            db.push(newMessage);
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

            console.log('Message Received:', newMessage);
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// Messaging API (POST /api/send)
app.post('/api/send', async (req, res) => {
    const { to, text, templateName, components } = req.body;

    if (!to) return res.status(400).json({ error: 'Recipient number (to) is required' });

    try {
        let payload;
        if (templateName) {
            payload = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'en_US' },
                    components: components || []
                }
            };
        } else {
            payload = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: text }
            };
        }

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            payload,
            { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
        );

        // Log outbound message
        const outboundMsg = {
            id: response.data.messages[0].id,
            from: to,
            name: 'Customer',
            text: text || `[Template: ${templateName}]`,
            timestamp: new Date().toISOString(),
            direction: 'outbound'
        };

        const db = JSON.parse(fs.readFileSync(DB_PATH));
        db.push(outboundMsg);
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Send Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to send message', details: error.response ? error.response.data : error.message });
    }
});

// API to get chat history
app.get('/api/messages', (req, res) => {
    const db = JSON.parse(fs.readFileSync(DB_PATH));
    res.json(db);
});

app.listen(PORT, () => {
    console.log(`WhatsApp Service running on port ${PORT}`);
});
