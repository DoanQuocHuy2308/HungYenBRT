import sys
import json
import os
import cv2
import numpy as np
from pyzbar.pyzbar import decode
from PIL import Image, ExifTags, ImageEnhance

# Fix encoding issue on Windows for console output
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class QRScannerExpert:
    
    def __init__(self):
        self.use_wechat = False
        try:
            if hasattr(cv2, 'wechat_qrcode_WeChatQRCode'):
                pass
        except:
            pass

    def preprocess_image(self, img):
        variants = []
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        variants.append(("Original", gray))
        
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        variants.append(("CLAHE", enhanced))
        
        thresh_adapt = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5)
        variants.append(("Adaptive Thresh", thresh_adapt))

        _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        variants.append(("Otsu Thresh", thresh_otsu))

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morph = cv2.morphologyEx(thresh_otsu, cv2.MORPH_CLOSE, kernel)
        variants.append(("Morphological", morph))

        blur = cv2.GaussianBlur(gray, (0, 0), 3)
        sharpened = cv2.addWeighted(gray, 1.5, blur, -0.5, 0)
        variants.append(("Sharpened", sharpened))
        
        padded = cv2.copyMakeBorder(gray, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)
        variants.append(("Padded White Border", padded))
        
        return variants

    def decode_robustly(self, img):
        scales = [1.0, 0.5, 1.5, 0.75, 2.0]
        
        for scale in scales:
            if scale == 1.0:
                working_img = img
            else:
                working_img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            
            variants = self.preprocess_image(working_img)
            
            for name, v_img in variants:
                decoded_objects = decode(v_img)
                if decoded_objects:
                    return decoded_objects[0].data
                    
        return None

    def fix_encoding(self, raw_data):
        if not raw_data:
            return ""
            
        if isinstance(raw_data, bytes):
            try:
                text = raw_data.decode('utf-8')
                if any(c in text for c in "ﾃ盻ﾄｳｺ"):
                    try:
                        return text.encode('shift-jis').decode('utf-8')
                    except:
                        return text
                return text
            except UnicodeDecodeError:
                try:
                    return raw_data.decode('shift-jis').encode('cp1252').decode('utf-8')
                except:
                    return raw_data.decode('utf-8', errors='replace')
        
        if isinstance(raw_data, str) and any(c in raw_data for c in "ﾃ盻ﾄｳｺ"):
            try:
                return raw_data.encode('shift-jis').decode('utf-8')
            except:
                pass
                
        return str(raw_data)

    def scan(self, image_path):
        if not os.path.exists(image_path):
            return {"success": False, "message": f"Không tìm thấy file: {image_path}"}

        try:
            pil_img = Image.open(image_path)
            try:
                orientation = None
                for k, v in ExifTags.TAGS.items():
                    if v == 'Orientation':
                        orientation = k
                        break
                
                exif = pil_img._getexif()
                if exif and orientation in exif:
                    val = exif[orientation]
                    if val == 3: pil_img = pil_img.rotate(180, expand=True)
                    elif val == 6: pil_img = pil_img.rotate(270, expand=True)
                    elif val == 8: pil_img = pil_img.rotate(90, expand=True)
            except:
                pass
            
            img = cv2.cvtColor(np.array(pil_img.convert('RGB')), cv2.COLOR_RGB2BGR)
            raw_data = self.decode_robustly(img)
            
            if not raw_data:
                return {"success": False, "message": "Không tìm thấy mã QR trên ảnh này."}

            qr_text = self.fix_encoding(raw_data)
            if '|' in qr_text:
                # Phân tích chuỗi CCCD
                parts = qr_text.split('|')
                if len(parts) >= 6:
                    return {
                        "success": True,
                        "data": {
                            "cccd_number": parts[0],
                            "old_id": parts[1] if len(parts) > 1 else "",
                            "name": parts[2],
                            "birthday": f"{parts[3][4:8]}-{parts[3][2:4]}-{parts[3][0:2]}" if len(parts[3]) == 8 else parts[3],
                            "sex": parts[4],
                            "address": parts[5],
                            "issue_date": f"{parts[6][4:8]}-{parts[6][2:4]}-{parts[6][0:2]}" if len(parts) > 6 and len(parts[6]) == 8 else "",
                            "raw_data": qr_text
                        }
                    }
            
            return {
                "success": False,
                "data": { "raw_text": qr_text },
                "message": "Đã tìm thấy mã nhưng không phải mã QR CCCD hợp lệ."
            }

        except Exception as e:
            return {"success": False, "message": f"Lỗi hệ thống: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "Thiếu đường dẫn ảnh"}))
        sys.exit(1)

    image_paths = sys.argv[1:]
    scanner = QRScannerExpert()
    
    last_error_message = "Không tìm thấy mã QR trong các ảnh đã cung cấp."
    
    for path in image_paths:
        result = scanner.scan(path)
        if result.get("success"):
            # Nếu tìm thấy mã QR ở bất kỳ ảnh nào, trả về kết quả ngay lập tức
            output_json = json.dumps(result, ensure_ascii=False)
            sys.stdout.buffer.write(output_json.encode('utf-8'))
            sys.stdout.buffer.write(b'\n')
            sys.stdout.flush()
            sys.exit(0)
        else:
            last_error_message = result.get("message", last_error_message)

    # Nếu đi hết vòng lặp mà không thấy mã nào
    final_result = {"success": False, "message": last_error_message}
    output_json = json.dumps(final_result, ensure_ascii=False)
    sys.stdout.buffer.write(output_json.encode('utf-8'))
    sys.stdout.buffer.write(b'\n')
    sys.stdout.flush()


