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
    const orderId = 'UMR-2fac6c9f-BLN1-1787311081174';
    const cicilanKe = 1;
    const firstName = 'dummy';
    const email = 'dummy@example.com';
    const cleanPhone = '081234567890';
    const grossAmount = 4524;

    const vaInfo = {
        expired_time: 60,
        reusable_status: false,
    };

    const body = {
      order: {
        amount: grossAmount,
        invoice_number: orderId
      },
      virtual_account_info: vaInfo,
      customer: {
        name: firstName,
        email: email,
        phone: cleanPhone,
      }
    };
    
    console.log("Testing exact route.ts payload for BRI:");
    await testEndpoint(body);
}
run();
