fetch('http://localhost:3000/zalopay/force-confirm/TEST1234', {
    method: 'POST'
}).then(r => r.json()).then(console.log);
