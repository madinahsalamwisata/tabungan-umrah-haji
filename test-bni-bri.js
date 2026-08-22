const crypto = require('crypto');

const clientId = 'BRN-0247-1786681390243';
const secretKey = 'SK-PvV8TAXGWQ8TkJoAjPqM';
const baseUrl = 'https://api.doku.com';

async function testEndpoint(targetPath, vaInfo) {
    const body = { order: { amount: 10000, invoice_number: 'INV-' + Date.now() }, virtual_account_info: vaInfo, customer: { name: 'test', email: 'test@example.com', phone: '081234567890' } };
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
    console.log("Testing BNI with long reference:");
    await testEndpoint('/bni-virtual-account/v2/payment-code', { expired_time: 60, reusable_status: false, merchant_unique_reference: 'LONG1234567890123' });
    
    console.log("Testing BNI with short reference:");
    await testEndpoint('/bni-virtual-account/v2/payment-code', { expired_time: 60, reusable_status: false, merchant_unique_reference: '1234567890' });
    
    console.log("Testing BRI with info1/info2 and merchant_unique_reference:");
    await testEndpoint('/bri-virtual-account/v2/payment-code', { expired_time: 60, reusable_status: false, merchant_unique_reference: '1234567890', info1: 'test', info2: 'test' });
    
    console.log("Testing BRI with only basic fields:");
    await testEndpoint('/bri-virtual-account/v2/payment-code', { expired_time: 60, reusable_status: false, info1: 'test', info2: 'test' });

    console.log("Testing BRI with NO info fields:");
    await testEndpoint('/bri-virtual-account/v2/payment-code', { expired_time: 60, reusable_status: false });
}
run();
