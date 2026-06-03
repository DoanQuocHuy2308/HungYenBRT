fetch('http://localhost:3000/zalopay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 7000, orderId: "TEST1234", description: "Test" })
}).then(r => r.json()).then(console.log);
