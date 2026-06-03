const zaloPaySvc = require('./services/zaloPayService');

async function testLocalhost() {
    try {
        const orderId = Date.now().toString();
        const res = await zaloPaySvc.createOrder({
            amount: 7000,
            orderId,
            description: "Test payment localhost",
            callbackUrl: "http://localhost:3000/zalopay/callback",
            redirectUrl: "http://localhost:3003/zalopay/return"
        });
        console.log("Create order result:", res);
    } catch (e) {
        console.error("Test failed", e);
    }
}
testLocalhost();
