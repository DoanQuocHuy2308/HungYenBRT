const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class UploadController {
    static async scanCCCD(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                console.error('[SCAN CCCD] Multer lỗi: Không nhận được file nào. Kiểm tra field name "cccd_images"');
                return res.status(400).json({ success: false, message: 'Vui lòng upload ảnh CCCD' });
            }

            const imagePaths = req.files.map(file => file.path);
            const imageNames = req.files.map(file => file.originalname).join(', ');
            console.log(`[SCAN CCCD] Đã nhận ${req.files.length} file: ${imageNames} -> Lưu tại: ${imagePaths.join(', ')}`);

            const pythonScriptPath = path.join(__dirname, '..', 'python_scripts', 'scan_qr.py');
            // Ghép tất cả các đường dẫn ảnh vào lệnh Python (mỗi đường dẫn bọc trong ngoặc kép)
            const args = imagePaths.map(p => `"${p}"`).join(' ');
            const command = `chcp 65001 | python "${pythonScriptPath}" ${args}`;

            console.log(`[SCAN CCCD] Gọi lệnh Python: ${command}`);

            exec(command, { encoding: 'buffer', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }, (error, stdoutBuffer, stderrBuffer) => {
                if (error) {
                    console.error('[SCAN CCCD] Python crash:', error.message);
                    return res.status(500).json({ success: false, message: 'Lỗi khi xử lý ảnh CCCD' });
                }

                const stderr = stderrBuffer ? stderrBuffer.toString('utf8').trim() : '';
                if (stderr) console.warn('[SCAN CCCD] Python stderr:', stderr);

                try {
                    let stdout = stdoutBuffer.toString('utf8').trim();
                    console.log(`[SCAN CCCD] Python stdout raw: ${stdout}`);

                    // Lấy dòng JSON cuối cùng (bỏ qua dòng rác \r\n chcp)
                    const lines = stdout.split('\n').map(l => l.trim()).filter(l => l.startsWith('{'));
                    const jsonLine = lines[lines.length - 1];
                    
                    if (!jsonLine) {
                        console.error('[SCAN CCCD] Python không trả về JSON hợp lệ. stdout đầy đủ:', stdout);
                        return res.status(400).json({ success: false, message: 'Không tìm thấy mã QR trên ảnh. Vui lòng chụp lại rõ hơn!' });
                    }

                    const result = JSON.parse(jsonLine);
                    console.log(`[SCAN CCCD] Kết quả từ Python:`, result);

                    if (result.success) {
                        return res.status(200).json({
                            success: true,
                            message: 'Quét QR thành công',
                            data: result.data,
                            file_paths: req.files ? req.files.map(f => `/temp_uploads/${f.filename}`) : []
                        });
                    } else {
                        return res.status(400).json({ success: false, message: result.message || 'Không tìm thấy QR code hợp lệ trên ảnh' });
                    }
                } catch (parseError) {
                    console.error('[SCAN CCCD] Lỗi parse JSON từ Python:', parseError.message);
                    return res.status(500).json({ success: false, message: 'Lỗi đọc kết quả từ Python' });
                }
            });
        } catch (err) {
            console.error('[SCAN CCCD] Lỗi hệ thống:', err.message);
            res.status(500).json({ success: false, message: 'Lỗi server upload: ' + err.message });
        }
    }

    static async uploadPromotionBanner(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Không nhận được file ảnh' });
            }
            const publicUrl = `/uploads/${req.file.filename}`;
            res.status(200).json({ 
                success: true, 
                message: 'Tải ảnh lên thành công', 
                url: publicUrl 
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi server upload: ' + err.message });
        }
    }
}

module.exports = UploadController;
