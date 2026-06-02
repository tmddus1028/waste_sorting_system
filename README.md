# Waste Sorting System

AI 기반 쓰레기 분리배출 가이드 웹 애플리케이션

---

## 프로젝트 구조

```
waste sorting system/
├── frontend/                   # 프론트엔드 (Vite + Vanilla JS)
│   ├── index.html
│   ├── upload.html
│   ├── result.html
│   ├── login.html
│   ├── register.html
│   ├── guide.html
│   ├── guide-detail.html
│   ├── search.html
│   ├── local-rules.html
│   ├── admin.html
│   ├── style.css
│   ├── script.js
│   ├── supabase-client.js
│   ├── upload.js / result.js / login.js / register.js
│   ├── guide.js / guide-detail.js / search.js
│   ├── local-rules.js / admin.js
│   ├── images/
│   ├── .env                    # VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
│   └── package.json
│
├── backend/                    # 백엔드 (Python FastAPI)
│   ├── app.py                  # API 서버 메인
│   ├── train.py                # 모델 학습 스크립트
│   ├── predict_test.py         # 로컬 예측 테스트
│   ├── requirements.txt
│   ├── model/
│   │   └── waste_model.pth     # 학습된 AI 모델 (여기에 위치)
│   └── archive/                # 학습 데이터셋 (train/, valid/, test/)
│
├── supabase/                   # Supabase 설정
├── supabase-login-db.sql       # DB 스키마
├── start_backend.bat           # 백엔드 실행 스크립트
└── start_web.bat               # 프론트엔드 실행 스크립트
```

---

## 실행 방법

### 1. 백엔드 서버 실행

```
start_backend.bat
```

또는 직접 실행:

```bash
# 프로젝트 루트에서
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

**패키지 설치 (최초 1회):**

```bash
pip install -r backend\requirements.txt
```

**모델 파일 위치:** `backend/model/waste_model.pth`

### 2. 프론트엔드 서버 실행

```
start_web.bat
```

또는 직접 실행:

```bash
cd frontend
npm install    # 최초 1회
npm run dev
```

---

## 환경 변수

`frontend/.env` 파일에 Supabase 설정을 입력합니다:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
```

---

## 모델 학습

데이터셋은 `backend/archive/` 폴더 안에 `train/`, `valid/` 구조로 위치해야 합니다.

```bash
python backend/train.py
```

학습된 모델은 `backend/model/waste_model.pth`에 저장됩니다.

---

## 기술 스택

- **Frontend:** Vanilla JS, Vite, Supabase JS SDK
- **Backend:** Python, FastAPI, PyTorch, torchvision
- **Database:** Supabase (PostgreSQL)
- **AI Model:** EfficientNet-B2 / MobileNet-V2
