import crypto from "crypto";

export function generateDokuDigest(body: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(body)).digest('base64');
}

export function generateDokuSignature(
    clientId: string,
    requestId: string,
    requestTimestamp: string,
    requestTarget: string,
    digest: string | null,
    secretKey: string
): string {
    let componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}`;
    if (digest) {
        componentSignature += `\nDigest:${digest}`;
    }
    const hmac = crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64');
    return `HMACSHA256=${hmac}`;
}
