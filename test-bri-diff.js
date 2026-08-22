const crypto = require('crypto');

const clientId = 'BRN-0247-1786681390243';
const secretKey = 'SK-PvV8TAXGWQ8TkJoAjPqM';
const baseUrl = 'https://api.doku.com';
const targetPath = '/bri-virtual-account/v2/payment-code';

async function testEndpoint(body) {
    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().substring(0, 19) + 'Z';
    const digest = crypto.createHash('sha256').update(JSON.stringify(body)).digest('base64');
    const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;
    const hmac = crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64');
    const signature = `HMACSHA256=${hmac}`;

    const res = await fetch(baseUrl + targetPath, {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    console.log(`[BRI] ` + await res.text());
}

async function run() {
    console.log("Testing with amount 10000 but full exact payload:");
    await testEndpoint({
      order: { amount: 10000, invoice_number: 'UMR-2fac6c9f-BLN1-1787311081174' },
      virtual_account_info: { expired_time: 60, reusable_status: false },
      customer: { name: 'dummy', email: 'dummy@example.com', phone: '081234567890' }
    });

    console.log("Testing with amount 4524 but minimal payload:");
    await testEndpoint({
      order: { amount: 4524, invoice_number: 'INV-123' },
      virtual_account_info: { expired_time: 60, reusable_status: false },
      customer: { name: 'dummy', email: 'dummy@example.com' }
    });
}
run();
