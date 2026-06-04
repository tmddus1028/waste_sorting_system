# Waste Sorting System

AI 기반 쓰레기 분리배출 가이드 웹 애플리케이션

---

## 1. 프로젝트 소개

**Waste Sorting System**은 사용자가 쓰레기 이미지를 업로드하면 AI 모델이 쓰레기 종류를 예측하고, 해당 품목의 분리배출 방법을 안내하는 웹 애플리케이션입니다.

사용자는 이미지 기반 AI 분류 기능뿐만 아니라 품목별 분리배출 가이드, 재활용 정보 검색, 지역별 분리배출 규칙 조회 기능을 함께 이용할 수 있습니다.

본 프로젝트는 프론트엔드와 백엔드를 분리하여 구현하였으며, 프론트엔드는 **Vercel**, 백엔드는 **Render**, 데이터베이스와 인증 기능은 **Supabase**를 사용하여 배포 및 연동하였습니다.

---

## 2. 배포 주소

- **프론트엔드 배포 주소:** https://waste-sorting-system.vercel.app/
- **백엔드 API 주소:** https://waste-sorting-api-cyky.onrender.com
 
**> ⚠️ 백엔드 서버는 Render 무료 플랜으로 배포되어 있습니다. 무료 플랜 특성상 서버가 일정 시간 사용되지 않으면 절전 상태로 전환될 수 있으며, 첫 요청 시 서버가 다시 활성화되는 과정에서 응답이 1분~2분 소요됩니다.**
---

## 3. 주요 기능

### 3.1 이미지 업로드 기반 AI 쓰레기 분류

사용자가 쓰레기 이미지를 업로드하면 백엔드 서버의 AI 모델이 이미지를 분석하여 쓰레기 종류를 예측합니다.

예측 결과에 따라 다음 정보를 제공합니다.

- 예측된 쓰레기 종류
- 예측 신뢰도
- 분리배출 방법
- 재활용 가능 여부
- 관련 상세 가이드

### 3.2 품목별 분리배출 가이드

종이, 플라스틱, 캔, 유리병, 비닐, 음식물 쓰레기, 일반 쓰레기 등 주요 품목에 대한 분리배출 방법을 제공합니다.

### 3.3 재활용 정보 검색

사용자가 품목명을 입력하면 해당 품목과 관련된 재활용 정보를 검색할 수 있습니다.

### 3.4 지역별 분리배출 규칙 조회

지역별로 다르게 적용될 수 있는 분리배출 규칙을 조회할 수 있습니다.

### 3.5 회원가입 및 로그인

Supabase Auth를 이용하여 회원가입과 로그인을 구현하였습니다.

로그인한 사용자는 이미지 업로드 기능을 사용할 수 있으며, 관리자 계정은 관리자 페이지에 접근할 수 있습니다.

### 3.6 관리자 페이지

관리자는 관리자 페이지에서 다음 데이터를 관리할 수 있습니다.

- 재활용 품목 정보
- 분리배출 상세 가이드
- 지역별 분리배출 규칙

---

## 4. AI 모델 관련 안내

본 프로젝트의 AI 분류 기능은 외부 상용 AI API를 단순 호출한 것이 아니라, 직접 학습한 이미지 분류 모델을 사용하여 구현하였습니다.

백엔드에서는 `Ultralytics YOLO` 기반 분류 모델을 사용하며, 학습된 모델 파일은 다음 위치에 배치됩니다.

```text
backend/model/best.pt
```

**⚠️ 다만 직접 수집 및 학습한 데이터셋을 기반으로 만든 모델이기 때문에 모든 이미지에 대해 항상 정확한 결과를 보장하지는 않습니다.**

특히 다음과 같은 경우에는 예측 결과가 부정확할 수 있습니다.

- 사진이 흐리거나 어두운 경우
- 쓰레기 객체가 작게 찍힌 경우
- 여러 종류의 쓰레기가 한 이미지에 함께 있는 경우
- 학습 데이터에 충분히 포함되지 않은 형태의 쓰레기인 경우
- 플라스틱, 캔, 유리 등 외형이 비슷한 품목인 경우

따라서 AI 예측 결과는 분리배출을 돕기 위한 참고용 정보이며, 실제 배출 시에는 사용자의 지역별 분리배출 기준을 함께 확인하는 것이 좋습니다.

---

## 5. 배포 환경 안내

### 5.1 Frontend

프론트엔드는 Vite 기반 Vanilla JavaScript 프로젝트이며, **Vercel**을 통해 배포하였습니다.

- 배포 플랫폼: Vercel
- 실행 환경: Static Web Hosting
- 주요 역할:
  - 사용자 화면 제공
  - 이미지 업로드 UI 제공
  - Supabase 로그인/회원가입 연동
  - 백엔드 API 호출
  - 가이드, 검색, 지역별 규칙 화면 제공

### 5.2 Backend

백엔드는 Python FastAPI 서버이며, **Render**를 통해 배포하였습니다.

- 배포 플랫폼: Render
- 서버 프레임워크: FastAPI
- AI 모델: Ultralytics YOLO Classification
- 주요 역할:
  - 이미지 예측 API 제공
  - 재활용 정보 검색 API 제공
  - AI 모델 로드 및 예측 수행

> 현재 백엔드는 Render 무료 플랜을 사용하고 있어 CPU 자원이 제한적입니다. 특히 AI 이미지 분석은 모델 추론 과정이 필요하기 때문에 일반 페이지 이동이나 검색 기능보다 응답 시간이 더 오래 걸릴 수 있습니다.

### 5.3 Database / Auth

사용자 인증과 데이터 관리는 Supabase를 사용하였습니다.

- Supabase Auth: 회원가입, 로그인
- Supabase Database: 재활용 품목, 가이드, 지역별 규칙 저장
- 관리자 페이지: Supabase 테이블 CRUD 연동

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
├── frontend/                         # 프론트엔드 (Vite + Vanilla JS)
│   ├── index.html                    # 메인 페이지
│   ├── upload.html                   # 이미지 업로드 페이지
│   ├── result.html                   # AI 분석 결과 페이지
│   ├── login.html                    # 로그인 페이지
│   ├── register.html                 # 회원가입 페이지
│   ├── guide.html                    # 분리배출 가이드 목록 페이지
│   ├── guide-detail.html             # 분리배출 상세 가이드 페이지
│   ├── search.html                   # 재활용 정보 검색 페이지
│   ├── local-rules.html              # 지역별 분리배출 규칙 페이지
│   ├── admin.html                    # 관리자 페이지
│   ├── style.css                     # 전체 스타일
│   ├── script.js                     # 공통 스크립트
│   ├── supabase-client.js            # Supabase 클라이언트 설정
│   ├── upload.js                     # 이미지 업로드 및 예측 요청
│   ├── result.js                     # 결과 화면 처리
│   ├── login.js                      # 로그인 처리
│   ├── register.js                   # 회원가입 처리
│   ├── guide.js                      # 가이드 목록 처리
│   ├── guide-detail.js               # 상세 가이드 처리
│   ├── search.js                     # 재활용 정보 검색 처리
│   ├── local-rules.js                # 지역별 규칙 처리
│   ├── admin.js                      # 관리자 CRUD 처리
│   ├── images/                       # 이미지 리소스
│   └── package.json
│
├── backend/                          # 백엔드 (Python FastAPI)
│   ├── app.py                        # FastAPI 서버 메인 파일
│   ├── train.py                      # AI 모델 학습 스크립트
│   ├── predict_test.py               # 로컬 예측 테스트 파일
│   ├── requirements.txt              # Python 패키지 목록
│   └── model/
│       └── best.pt                   # 학습된 YOLO 모델 파일
│
├── supabase/                         # Supabase 관련 설정
├── supabase-login-db.sql             # Supabase DB 스키마
├── start_backend.bat                 # 로컬 백엔드 실행 스크립트
└── start_web.bat                     # 로컬 프론트엔드 실행 스크립트
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

본 프로젝트는 단순히 정적인 분리배출 정보를 제공하는 웹 페이지가 아니라, 사용자가 직접 이미지를 업로드하면 AI 모델이 쓰레기 종류를 예측하고 그에 맞는 분리배출 정보를 제공하는 시스템입니다.

또한 프론트엔드, 백엔드, 데이터베이스, 인증 기능을 분리하여 구성함으로써 실제 웹 서비스와 유사한 구조로 구현하였습니다.

특히 AI 모델을 직접 학습하고 FastAPI 서버에 연결하여 이미지 기반 예측 기능을 구현했다는 점에서 의미가 있습니다.

---

