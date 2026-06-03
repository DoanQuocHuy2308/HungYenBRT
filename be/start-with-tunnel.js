/**
 * start-with-tunnel.js
 * Chạy script này để tự động:
 *  1. Tạo tunnel localtunnel → public HTTPS URL
 *  2. Ghi BASE_URL vào .env
 *  3. Khởi động backend Express
 * 
 * Cách dùng: node start-with-tunnel.js
 */

const localtunnel = require('localtunnel');
const { spawn }   = require('child_process');
const fs          = require('fs');
const path        = require('path');

const PORT    = 3000;
const ENVFILE = path.join(__dirname, '.env');

function updateEnv(key, value) {
    let content = '';
    try { content = fs.readFileSync(ENVFILE, 'utf8'); } catch {}
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
    } else {
        content = content.trimEnd() + `\n${key}=${value}\n`;
    }
    fs.writeFileSync(ENVFILE, content, 'utf8');
}

async function main() {
    console.log('🌐 Đang tạo tunnel localtunnel...');
    let tunnel;
    try {
        tunnel = await localtunnel({ port: PORT, subdomain: 'hungyenbrt-zalopay' });
    } catch {
        // Subdomain đã bị dùng → để localtunnel tự chọn
        tunnel = await localtunnel({ port: PORT });
    }

    const publicUrl = tunnel.url;
    console.log(`✅ Tunnel URL: ${publicUrl}`);
    console.log(`📌 ZaloPay callback sẽ gọi về: ${publicUrl}/zalopay/callback`);

    // Cập nhật .env
    updateEnv('BASE_URL', publicUrl);
    console.log(`📝 Đã cập nhật BASE_URL vào .env`);

    // Khởi động backend
    console.log('🚀 Khởi động backend Express...\n');
    const server = spawn('node', ['./bin/www'], {
        stdio: 'inherit',
        env:   { ...process.env, BASE_URL: publicUrl },
    });

    tunnel.on('close', () => {
        console.log('\n⚠️  Tunnel đã đóng. Backend vẫn chạy nhưng ZaloPay callback sẽ không tới được.');
    });

    process.on('SIGINT', () => {
        console.log('\n👋 Đang tắt...');
        tunnel.close();
        server.kill();
        process.exit(0);
    });
}

main().catch(err => {
    console.error('❌ Lỗi khởi động tunnel:', err.message);
    console.log('⚠️  Chạy backend không có tunnel (callback ZaloPay sẽ không hoạt động với localhost)');
    const server = spawn('node', ['./bin/www'], { stdio: 'inherit' });
    process.on('SIGINT', () => { server.kill(); process.exit(0); });
});
