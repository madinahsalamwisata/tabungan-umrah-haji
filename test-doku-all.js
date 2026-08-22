const crypto = require('crypto');

const clientId = 'BRN-0247-1786681390243';
const secretKey = 'SK-PvV8TAXGWQ8TkJoAjPqM';
const baseUrl = 'https://api.doku.com';

async function testEndpoint(targetPath) {
    const body = { order: { amount: 10000, invoice_number: 'TEST-123' }, virtual_account_info: { expired_time: 60, reusable_status: false, merchant_unique_reference: 'TEST-123', info1: 'test' }, customer: { name: 'test', email: 'test@example.com', phone: '081234567890' } };
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
    console.log(`[${targetPath}] ` + await res.text());
}

async function run() {
    await testEndpoint('/bsm-virtual-account/v2/payment-code');
    await testEndpoint('/mandiri-virtual-account/v2/payment-code');
    await testEndpoint('/bni-virtual-account/v2/payment-code');
}
run();
