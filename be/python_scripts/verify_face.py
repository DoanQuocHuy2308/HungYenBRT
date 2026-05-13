import sys
import json
import os
import cv2
import numpy as np

# Force UTF-8 output
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class FaceVerifierExpert:
    
    def __init__(self):
        try:
            import face_recognition
            self.fr = face_recognition
        except ImportError:
            self.fr = None

    def assess_image_quality(self, image_cv, face_location):
        top, right, bottom, left = face_location
        # Mở rộng vùng mặt một chút
        h, w = image_cv.shape[:2]
        face_roi = image_cv[max(0, top-20):min(h, bottom+20), max(0, left-20):min(w, right+20)]
        
        if face_roi.size == 0:
            return {"valid": False, "reason": "Lỗi trích xuất vùng khuôn mặt"}

        gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 50: 
            return {"valid": False, "reason": f"Ảnh quá mờ hoặc nghi ngờ giả mạo (độ sắc nét: {laplacian_var:.1f})"}

        mean_brightness = np.mean(gray)
        if mean_brightness < 30:
            return {"valid": False, "reason": "Khuôn mặt quá tối, vui lòng đến nơi có ánh sáng tốt hơn"}
        elif mean_brightness > 240:
            return {"valid": False, "reason": "Khuôn mặt bị chói sáng quá mức"}

        return {"valid": True, "blur_score": laplacian_var, "brightness": mean_brightness}

    def get_best_encoding(self, image_path, check_quality=False):
        if not self.fr:
            raise ImportError("Thiếu thư viện face_recognition")

        image = self.fr.load_image_file(image_path)
        img_cv = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)) 
        cl = clahe.apply(l)
        final_img = cv2.cvtColor(cv2.merge((cl,a,b)), cv2.COLOR_LAB2RGB)

        face_locations = self.fr.face_locations(final_img, model="hog")
        if not face_locations:
            return None, "Không tìm thấy khuôn mặt trong khung hình"

        best_face = None
        max_area = 0
        for (top, right, bottom, left) in face_locations:
            area = (bottom - top) * (right - left)
            if area > max_area:
                max_area = area
                best_face = (top, right, bottom, left)

        # Kiểm tra liveness & chất lượng (chỉ áp dụng cho ảnh chụp trực tiếp từ camera, không áp dụng cho avatar gốc)
        if check_quality:
            quality = self.assess_image_quality(img_cv, best_face)
            if not quality["valid"]:
                return None, f"Từ chối an ninh: {quality['reason']}"

        encodings = self.fr.face_encodings(final_img, known_face_locations=[best_face])
        return encodings[0], None

    def verify(self, stored_path, captured_path, threshold=0.5):
        if not self.fr:
            return {"match": False, "error": "Thiếu thư viện face_recognition. Chạy: pip install face_recognition"}

        try:
            # Lấy encoding từ ảnh avatar (đã lưu) - KHÔNG kiểm tra liveness vì đây là ảnh tham chiếu
            stored_encoding, err1 = self.get_best_encoding(stored_path, check_quality=False)
            if err1:
                return {"match": False, "error_code": "AVATAR_INVALID", "error": f"Dữ liệu gốc: {err1}"}

            # Lấy encoding từ ảnh chụp (camera) - BẬT kiểm tra liveness chống giả mạo
            captured_encoding, err2 = self.get_best_encoding(captured_path, check_quality=True)
            if err2:
                # Phân loại lỗi do Anti-spoofing hay do không thấy mặt
                code = "SPOOF_DETECTED" if "Từ chối" in err2 else "FACE_NOT_FOUND"
                return {"match": False, "error_code": code, "error": f"{err2}"}

            distance = self.fr.face_distance([stored_encoding], captured_encoding)[0]
            
            is_match = bool(distance < threshold)

            return {
                "match": is_match,
                "distance": round(float(distance), 4),
                "threshold": threshold,
                "message": "Khớp khuôn mặt" if is_match else "Không khớp khuôn mặt"
            }

        except Exception as e:
            return {"match": False, "error": f"Lỗi xử lý: {str(e)}"}

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({"match": False, "error": "Usage: verify_face.py <stored_path> <captured_path>"}, ensure_ascii=False))
        sys.exit(1)

    stored = sys.argv[1]
    captured = sys.argv[2]
    
    verifier = FaceVerifierExpert()
    result = verifier.verify(stored, captured)
    print(json.dumps(result, ensure_ascii=False))
