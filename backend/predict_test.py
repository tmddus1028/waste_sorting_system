import sys
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
MODEL_CANDIDATES = [
    BASE_DIR / "model" / "waste_model.pth",       # backend/model/ (분리 후 기본 위치)
    PROJECT_DIR / "model" / "waste_model.pth",    # 루트/model/ (기존 위치, fallback)
    PROJECT_DIR / "waste_model.pth",              # 루트/ (fallback)
    BASE_DIR / "waste_model.pth",                 # backend/ (fallback)
]
MODEL_PATH = next((path for path in MODEL_CANDIDATES if path.exists()), MODEL_CANDIDATES[0])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("사용 장치:", device)

if not MODEL_PATH.exists():
    print("모델 파일을 찾을 수 없습니다:", MODEL_PATH)
    sys.exit(1)

checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
class_names = checkpoint["class_names"]
model_name = checkpoint.get("model_name", "mobilenet_v2")

print("모델 파일:", MODEL_PATH)
print("모델 이름:", model_name)
print("분류 클래스:", class_names)

if model_name == "efficientnet_b2":
    model = models.efficientnet_b2(weights=None)
    model.classifier[1] = nn.Linear(1408, len(class_names))
    image_size = int(checkpoint.get("image_size", 260))
elif model_name == "mobilenet_v2":
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(1280, len(class_names))
    image_size = int(checkpoint.get("image_size", 224))
else:
    raise ValueError(f"지원하지 않는 모델입니다: {model_name}")

model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((image_size, image_size)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

if len(sys.argv) < 2:
    print("이미지 경로를 입력해야 합니다.")
    print("예시: python backend/predict_test.py backend/archive/test/plastic/plastic2.jpg")
    sys.exit(1)

image_path = Path(sys.argv[1])

if not image_path.exists():
    print("이미지 파일을 찾을 수 없습니다:", image_path)
    sys.exit(1)

image = Image.open(str(image_path)).convert("RGB")
image_tensor = transform(image).unsqueeze(0).to(device)

with torch.no_grad():
    outputs = model(image_tensor)
    probabilities = torch.softmax(outputs, dim=1)
    confidence, predicted = torch.max(probabilities, 1)

predicted_class = class_names[predicted.item()]
confidence_percent = confidence.item() * 100

print("예측 결과:", predicted_class)
print(f"정확도: {confidence_percent:.2f}%")
