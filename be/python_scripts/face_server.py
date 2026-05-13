import sys
import io
import json
import numpy as np
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = FastAPI(title="BRT Face Recognition Server")

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(f"[FaceServer] Đang khởi tạo MTCNN + FaceNet trên {device}...", flush=True)

mtcnn = MTCNN(
    image_size=160, margin=20, min_face_size=40,
    thresholds=[0.6, 0.7, 0.7], factor=0.709, post_process=True,
    device=device, keep_all=False
)

resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
print("[FaceServer] ✅ Model sẵn sàng!", flush=True)


def get_embedding(image: Image.Image):
    img_cropped = mtcnn(image)
    if img_cropped is None:
        return None, "Không tìm thấy khuôn mặt trong ảnh"
    img_tensor = img_cropped.unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = resnet(img_tensor).cpu().numpy()[0]
    embedding = embedding / np.linalg.norm(embedding)
    return embedding, None


@app.get("/health")
def health():
    return {"status": "ok", "device": str(device)}


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        embedding, error = get_embedding(image)
        if error:
            return JSONResponse({"success": False, "error": error})
        return JSONResponse({"success": True, "embedding": embedding.tolist()})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@app.post("/verify")
async def verify(
    avatar_path: str = Form(...),
    camera_file: UploadFile = File(...)
):
    try:
        avatar_img = Image.open(avatar_path).convert('RGB')
        ava_emb, err1 = get_embedding(avatar_img)
        if err1:
            return JSONResponse({"success": False, "error": f"Avatar: {err1}"})

        cam_bytes = await camera_file.read()
        cam_img = Image.open(io.BytesIO(cam_bytes)).convert('RGB')
        cam_emb, err2 = get_embedding(cam_img)
        if err2:
            return JSONResponse({"success": False, "error": f"Camera: {err2}"})

        dist = float(np.linalg.norm(ava_emb - cam_emb))
        threshold = 0.6
        is_match = dist < threshold

        return JSONResponse({
            "success": True,
            "match": is_match,
            "distance": round(dist, 4),
            "threshold": threshold,
            "message": "Trùng khớp khuôn mặt!" if is_match else "Khuôn mặt không khớp!"
        })
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001, log_level="warning")
