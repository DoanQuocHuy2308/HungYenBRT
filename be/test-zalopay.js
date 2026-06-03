const zaloPaySvc = require('./services/zaloPayService');

async function test() {
    try {
        const orderId = Date.now().toString();
        const res = await zaloPaySvc.createOrder({
            amount: 7000,
            orderId,
            description: "Test payment",
            callbackUrl: "https://google.com/callback",
            redirectUrl: "https://google.com"
        });
        console.log("Create order result:", res);
        
        if (res.return_code === 1) {
            const queryRes = await zaloPaySvc.queryOrder(res.app_trans_id);
            console.log("Query order result:", queryRes);
        }
    } catch (e) {
        console.error("Test failed", e);
    }
}
test();
