import sys
import json
import cv2
import numpy as np
import base64
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image

# Đảm bảo in ra UTF-8
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class MTCNNFaceExpert:
    def __init__(self):
        # Chọn thiết bị (GPU nếu có, không thì CPU)
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        
        self.mtcnn = MTCNN(
            image_size=160, margin=20, min_face_size=40,
            thresholds=[0.6, 0.7, 0.7], factor=0.709, post_process=True,
            device=self.device, keep_all=False
        )
        
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)

    def extract_embedding_from_avatar(self, image_path):
        try:
            img = Image.open(image_path).convert('RGB')
            
            img_cropped = self.mtcnn(img)
            
            if img_cropped is None:
                return {
                    "success": False,
                    "error": "Không tìm thấy khuôn mặt nào trong ảnh Avatar, hoặc ảnh quá mờ/nhỏ."
                }
            
            img_tensor = img_cropped.unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                embedding = self.resnet(img_tensor).cpu().numpy()[0]
                
            embedding = embedding / np.linalg.norm(embedding)
            
            return {
                "success": True,
                "message": "Trích xuất đặc trưng khuôn mặt thành công.",
                "embedding": embedding.tolist() 
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi xử lý ảnh: {str(e)}"
            }

    def verify_faces(self, avatar_embedding, camera_image_path, threshold=0.6):
        try:
            camera_result = self.extract_embedding_from_avatar(camera_image_path)
            if not camera_result["success"]:
                return {"match": False, "error": f"Camera: {camera_result['error']}"}
            
            cam_emb = np.array(camera_result["embedding"])
            ava_emb = np.array(avatar_embedding)
            
            dist = np.linalg.norm(ava_emb - cam_emb)
            
            is_match = bool(dist < threshold)
            
            return {
                "success": True,
                "match": is_match,
                "distance": round(float(dist), 4),
                "threshold": threshold,
                "message": "Trùng khớp khuôn mặt!" if is_match else "Khuôn mặt không khớp!"
            }
        except Exception as e:
            return {"success": False, "error": f"Lỗi so sánh: {str(e)}"}

if __name__ == '__main__':
    
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Thiếu tham số."}, ensure_ascii=False))
        sys.exit(1)
        
    action = sys.argv[1]
    expert = MTCNNFaceExpert()
    
    if action == "extract":
        avatar_path = sys.argv[2]
        result = expert.extract_embedding_from_avatar(avatar_path)
        print(json.dumps(result, ensure_ascii=False))
        
    elif action == "verify" and len(sys.argv) == 4:
        avatar_path = sys.argv[2]
        camera_path = sys.argv[3]
        
        ava_res = expert.extract_embedding_from_avatar(avatar_path)
        if not ava_res["success"]:
            print(json.dumps(ava_res, ensure_ascii=False))
            sys.exit(0)
            
        result = expert.verify_faces(ava_res["embedding"], camera_path)
        print(json.dumps(result, ensure_ascii=False))
        
    else:
        print(json.dumps({"success": False, "error": "Sai cú pháp lệnh."}, ensure_ascii=False))
