# Waste Sorting System

AI 기반 쓰레기 분리배출 가이드 웹 애플리케이션

---

## 1. 프로젝트 소개

**Waste Sorting System**은 사용자가 쓰레기 이미지를 업로드하면 AI 모델이 쓰레기 종류를 예측하고, 해당 품목의 분리배출 방법을 안내하는 웹 애플리케이션입니다.

이미지 기반 AI 분류 기능뿐만 아니라 품목별 분리배출 가이드, 재활용 정보 검색, 지역별 분리배출 규칙 조회 기능을 제공합니다.

본 프로젝트는 프론트엔드와 백엔드를 분리하여 구현하였으며, 프론트엔드는 **Vercel**, 백엔드는 **Render**, 데이터베이스와 인증 기능은 **Supabase**를 사용하여 배포 및 연동하였습니다.

---

## 2. 배포 주소

- **Frontend:** https://waste-sorting-system.vercel.app/
- **Backend API:** https://waste-sorting-api-cyky.onrender.com

> ⚠️ 백엔드 서버는 Render 무료 플랜으로 배포되어 있습니다.  
> 무료 플랜 특성상 서버가 일정 시간 사용되지 않으면 절전 상태로 전환될 수 있으며, 첫 요청 시 서버가 다시 활성화되는 과정에서 응답이 **1분~2분 정도 소요될 수 있습니다.**

---

## 3. 주요 기능

| 기능 | 설명 |
|---|---|
| 이미지 업로드 기반 AI 분류 | 사용자가 업로드한 쓰레기 이미지를 AI 모델이 분석하여 품목을 예측합니다. |
| 분리배출 가이드 | 종이, 플라스틱, 캔, 유리병, 비닐, 음식물 쓰레기, 일반 쓰레기 등의 배출 방법을 제공합니다. |
| 재활용 정보 검색 | 사용자가 입력한 품목명에 따라 재활용 정보를 검색할 수 있습니다. |
| 지역별 규칙 조회 | 지역별로 다른 분리배출 규칙을 확인할 수 있습니다. |
| 로그인 / 회원가입 | Supabase Auth를 이용하여 사용자 인증 기능을 구현하였습니다. |
| 관리자 페이지 | 관리자가 재활용 품목, 상세 가이드, 지역별 규칙 데이터를 관리할 수 있습니다. |

---

## 4. AI 분류 기능 실행 화면

아래 구역에는 AI 분류 기능을 실행한 화면 이미지를 직접 추가하면 됩니다.

<!-- 
GitHub README에 이미지를 넣는 방법 예시:

<img width="900" alt="AI 이미지 업로드 화면" src="이미지_URL_입력">
<img width="900" alt="AI 분석 결과 화면" src="이미지_URL_입력">

GitHub Issues 또는 README 편집 화면에 이미지를 드래그 앤 드롭하면 이미지 URL을 얻을 수 있습니다.
-->

### 4.1 이미지 업로드 화면

| AI 이미지 업로드 화면 |
|---|
| <img width="350" height="350" alt="알루미늄-캔-out8ddw1prsu66vkvy8lzwldoxwqczfjzdkx30piww" src="https://github.com/user-attachments/assets/096ae795-7c97-4d3f-85e1-623042471175" /><img width="350" height="350" alt="2Gt4Ph0WpKbAVLDtMA0VbhZPCbWN7xsrZB1n3IidxT0nVn3md3qknxvqmRDBXIKxPhnMKEtL3RIVPmGon27jgg" src="https://github.com/user-attachments/assets/21f9aa1d-57f7-4084-bdc6-e9a8cc190058" />


### 4.2 AI 분석 결과 화면

| AI 분석 결과 화면 |
|---|
| <img width="350" height="350" alt="image" src="https://github.com/user-attachments/assets/8f10ff0d-3b0a-4eec-9905-9b907bdb4871" /><img width="350" height="350" alt="페트병결과" src="https://github.com/user-attachments/assets/d9b67f37-af3d-4a06-8b2b-fd454fdbb1a9" />


---

## 5. AI 모델 관련 안내

본 프로젝트의 AI 분류 기능은 외부 상용 AI API를 단순 호출한 것이 아니라, 직접 학습한 이미지 분류 모델을 사용하여 구현하였습니다.

백엔드에서는 **Ultralytics YOLO Classification** 기반 모델을 사용하며, 학습된 모델 파일은 다음 위치에 배치됩니다.

```text
backend/model/best.pt
```

> ⚠️ 직접 수집 및 학습한 데이터셋을 기반으로 만든 모델이기 때문에 모든 이미지에 대해 항상 정확한 결과를 보장하지는 않습니다.

특히 다음과 같은 경우에는 예측 결과가 부정확할 수 있습니다.

- 사진이 흐리거나 어두운 경우
- 쓰레기 객체가 작게 찍힌 경우
- 여러 종류의 쓰레기가 한 이미지에 함께 있는 경우
- 학습 데이터에 충분히 포함되지 않은 형태의 쓰레기인 경우
- 플라스틱, 캔, 유리 등 외형이 비슷한 품목인 경우

따라서 AI 예측 결과는 분리배출을 돕기 위한 참고용 정보이며, 실제 배출 시에는 사용자의 지역별 분리배출 기준을 함께 확인하는 것이 좋습니다.

---

## 6. 기술 스택

### Frontend

- HTML
- CSS
- JavaScript
- Vite
- Supabase JavaScript SDK
- Vercel

### Backend

- Python
- FastAPI
- Uvicorn
- Pillow
- Ultralytics YOLO
- Render

### Database / Auth

- Supabase
- PostgreSQL
- Supabase Auth

---

## 7. 프로젝트 구조

```text
waste_sorting_system/
├── frontend/
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
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── train.py
│   ├── predict_test.py
│   ├── requirements.txt
│   └── model/
│       └── best.pt
│
├── supabase/
├── supabase-login-db.sql
├── start_backend.bat
└── start_web.bat
```

---

## 8. 사용 시 유의사항

- AI 분류 결과는 학습 데이터와 이미지 상태에 따라 달라질 수 있습니다.
- 직접 학습한 모델을 사용했기 때문에 모든 쓰레기 이미지를 완벽하게 분류하지는 못합니다.
- Render 무료 플랜의 CPU 제한으로 인해 AI 예측 응답이 느릴 수 있습니다.
- Render 서버가 절전 상태인 경우 첫 요청에서 시간이 더 오래 걸릴 수 있습니다.
- 실제 분리배출 시에는 거주 지역의 최신 분리배출 규정을 함께 확인하는 것이 좋습니다.

---

## 9. 구현 의의

본 프로젝트는 단순한 정보 제공 페이지가 아니라, 사용자가 직접 이미지를 업로드하면 AI 모델이 쓰레기 종류를 예측하고 그에 맞는 분리배출 정보를 제공하는 시스템입니다.

또한 프론트엔드, 백엔드, 데이터베이스, 인증 기능을 분리하여 실제 웹 서비스와 유사한 구조로 구현하였습니다.

특히 외부 상용 AI API가 아닌 직접 학습한 AI 모델을 FastAPI 서버와 연결하여 이미지 기반 분리배출 예측 기능을 구현했다는 점에서 의의가 있습니다.
