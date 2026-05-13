const { spawn } = require('child_process');
const path = require('path');
const db = require('../models');

class FaceRecognitionService {
    /**
     * Trích xuất embedding từ file ảnh avatar.
     * Trả về mảng 512 phần tử nếu thành công.
     */
    async extractFaceEmbedding(imagePath) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [
                path.join(__dirname, '../python_scripts/mtcnn_expert.py'),
                'extract',
                imagePath
            ]);

            let dataString = '';
            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            let errorString = '';
            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                try {
                    const result = JSON.parse(dataString);
                    if (result.success) {
                        resolve(result.embedding);
                    } else {
                        reject(new Error(result.error || 'Unknown error from Python'));
                    }
                } catch (e) {
                    console.error("Python Output Error:", dataString, errorString);
                    reject(new Error('Lỗi không xác định khi xử lý ảnh bằng MTCNN: ' + e.message));
                }
            });
        });
    }

    /**
     * So sánh ảnh camera với ảnh avatar
     */
    async verifyFace(avatarPath, cameraImagePath) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [
                path.join(__dirname, '../python_scripts/mtcnn_expert.py'),
                'verify',
                avatarPath,
                cameraImagePath
            ]);

            let dataString = '';
            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            let errorString = '';
            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                try {
                    const result = JSON.parse(dataString);
                    if (result.success) {
                        resolve({
                            match: result.match,
                            distance: result.distance,
                            message: result.message
                        });
                    } else {
                        reject(new Error(result.error || 'Lỗi xử lý verify_face'));
                    }
                } catch (e) {
                    console.error("Python Output Error:", dataString, errorString);
                    reject(new Error('Lỗi JSON từ script Python: ' + e.message));
                }
            });
        });
    }

    /**
     * Tự động đăng ký khuôn mặt cho user khi upload Avatar mới
     */
    async registerUserFace(userId, avatarPath) {
        try {
            const absolutePath = path.resolve(path.join(__dirname, '../', avatarPath));
            const embedding = await this.extractFaceEmbedding(absolutePath);
            
            await db.users.update(
                { 
                    face_data: JSON.stringify(embedding),
                    is_face_registered: true
                },
                { where: { id: userId } }
            );

            return { success: true, message: 'Đã cập nhật vector khuôn mặt thành công' };
        } catch (error) {
            console.error(`RegisterFace Error for user ${userId}:`, error.message);
            // Dù lỗi thì vẫn trả về để app biết, nhưng ko nên crash app
            return { success: false, error: error.message };
        }
    }
}

module.exports = new FaceRecognitionService();
