from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import os
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add this import
from inference_sdk import InferenceHTTPClient

app = FastAPI(title="Rice Disease Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model_path = os.getenv("MODEL_PATH", "detect-leaf-rice-disease-model.pt")
model = YOLO(model_path)

# Roboflow client
roboflow_api_key = os.getenv("ROBOFLOW_API_KEY", "2TFHpYrdVnE2nrbAeQ8t")
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=roboflow_api_key
)

target_size_env = int(os.getenv("TARGET_SIZE", "320"))
target_size = (target_size_env, target_size_env)

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "rice-disease-detection"}

@app.get("/")
async def root():
    return {"message": "Rice Disease Detection API", "version": "1.0.0"}

def segment_leaf(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    lower = np.array([25, 40, 40])
    upper = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower, upper)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7,7), np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(c)
        leaf = img[y:y+h, x:x+w]
        return cv2.resize(leaf, target_size), True
    return cv2.resize(img, target_size), False

def preprocess_image(file_bytes):
    img = Image.open(BytesIO(file_bytes)).convert("RGB")
    img = np.array(img)
    leaf_img, is_leaf = segment_leaf(img)
    temp_path = "temp_api.jpg"
    cv2.imwrite(temp_path, cv2.cvtColor(leaf_img, cv2.COLOR_RGB2BGR))
    _, buffer = cv2.imencode('.jpg', cv2.cvtColor(leaf_img, cv2.COLOR_RGB2BGR))
    img_b64 = base64.b64encode(buffer).decode('utf-8')
    return temp_path, leaf_img, img_b64, is_leaf

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_bytes = await file.read()

    # Save uploaded image temporarily for Roboflow check
    temp_input_path = "temp_input.jpg"
    with open(temp_input_path, "wb") as f:
        f.write(file_bytes)

    # Roboflow leaf detection
    roboflow_result = CLIENT.infer(temp_input_path, model_id="rice-leaf-disease-2p362/1")
    print("Roboflow result:", roboflow_result)  # Console log for debugging

    # Remove temp input image
    if os.path.exists(temp_input_path):
        os.remove(temp_input_path)

    # If no predictions or no "leafs" class, return error
    predictions = roboflow_result.get("predictions", [])
    is_rice_leaf = any(pred.get("class") == "leafs" for pred in predictions)
    if not predictions or not is_rice_leaf:
        _, _, img_b64, _ = preprocess_image(file_bytes)
        return {
            "error": "Ảnh không phải là lá lúa. Vui lòng thử lại với ảnh khác.",
            "processed_image": img_b64
        }

    # Continue with your YOLO disease detection
    temp_path, img_array, img_b64, is_leaf = preprocess_image(file_bytes)
    results = model(temp_path)
    probs = results[0].probs.data.tolist()
    names = results[0].names
    combined_probs = [(names[i], float(probs[i])) for i in range(len(names))]
    filtered_probs = [item for item in combined_probs if item[1] > 0]
    filtered_probs.sort(key=lambda x: x[1], reverse=True)
    high_conf = [item for item in filtered_probs if item[1] >= 0.98]
    if high_conf:
        result_probs = high_conf
    else:
        result_probs = filtered_probs[:5]
    pred_label = result_probs[0][0] if result_probs else None
    if os.path.exists(temp_path):
        os.remove(temp_path)
    if not result_probs or pred_label is None:
        return {
            "error": "Không thể nhận diện bệnh lúa. Vui lòng thử lại với ảnh khác.",
            "processed_image": img_b64
        }
    return {
        "predicted_class": pred_label,  
        "all_probs": result_probs,
        "processed_image": img_b64
    }