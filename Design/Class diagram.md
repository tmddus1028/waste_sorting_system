# 3.2 Class Description

본 절에서는 Waste Sorting System을 구성하는 주요 클래스들의 속성(Attributes), 메서드(Methods) 및 역할에 대해 상세히 기술한다.

---
<img width="1948" height="2025" alt="image" src="https://github.com/user-attachments/assets/74eab81b-8448-4b9d-b5d5-3d9902db4c74" />

### 1) User
#### (1) Attributes
* `name: String` : 사용자 이름
* `email: String` : 사용자 이메일
* `role: String` : 사용자의 권한 정보

#### (2) Methods
* `+ uploadImage(): void` : 사용자가 쓰레기 이미지를 업로드함
* `+ searchRecyclingInfo(): void` : 사용자가 품목명을 입력하여 재활용 정보를 검색함
* `+ viewGuide(): void` : 사용자가 품목별 상세 분리배출 가이드를 조회함

#### (3) Description
User 클래스는 시스템을 이용하는 일반 사용자를 의미한다. 사용자는 로그인 후 이미지를 업로드하여 AI 분석을 요청할 수 있으며, 분석 결과를 바탕으로 쓰레기 종류와 분리배출 방법을 확인할 수 있다. 또한 재활용 정보 검색, 상세 가이드 조회, 지역별 규칙 조회 기능을 사용할 수 있다.

---

### 2) AuthController
#### (1) Attributes
* `emailInput: String` : 사용자가 입력한 이메일
* `passwordInput: String` : 사용자가 입력한 비밀번호

#### (2) Methods
* `+ signInWithPassword(): void` : 이메일과 비밀번호를 이용하여 로그인을 수행함
* `+ signUp(): void` : 사용자가 입력한 정보로 회원가입을 수행함
* `+ upsertProfile(): void` : 회원가입 또는 로그인 후 사용자 프로필 정보를 저장하거나 갱신함

#### (3) Description
AuthController 클래스는 로그인과 회원가입 기능을 담당하는 프론트엔드 컨트롤러이다. 사용자가 입력한 이메일과 비밀번호를 Supabase 인증 기능에 전달하여 로그인 또는 회원가입을 처리한다. 인증이 성공하면 사용자 정보를 저장하고, 필요한 경우 사용자 프로필 데이터를 생성한다.

---

### 3) AuthStorage
#### (1) Attributes
* `currentUser: localStorage` : 현재 로그인한 사용자 정보
* `uploadHistory: localStorage` : 사용자의 최근 이미지 분석 기록

#### (2) Methods
* `+ requireLoginAsync(): boolean` : 사용자가 로그인 상태인지 확인함
* `+ requireAdminAsync(): boolean` : 현재 사용자가 관리자 권한을 가지고 있는지 확인함
* `+ readUploadHistory(): Array` : localStorage에 저장된 업로드 기록을 읽어옴
* `+ saveUploadHistory(): void` : 사용자의 이미지 분석 기록을 localStorage에 저장함

#### (3) Description
AuthStorage 클래스는 브라우저의 localStorage를 이용하여 로그인 상태와 업로드 기록을 관리한다. 사용자가 로그인하지 않은 상태에서 특정 페이지에 접근하려고 하면 접근을 제한한다. 또한 관리자 페이지에서는 사용자의 권한을 확인하여 관리자만 접근할 수 있도록 한다.

---

### 4) UploadController
#### (1) Attributes
* `selectedFile: File` : 사용자가 선택한 이미지 파일
* `selectedImageData: String` : 업로드된 이미지의 미리보기 데이터
* `cameraStream: Object` : 카메라 촬영 기능을 사용할 때 필요한 스트림 데이터

#### (2) Methods
* `+ requestPrediction(): void` : 선택한 이미지를 FastAPI 서버의 /predict API로 전송함
* `+ makeAnalysisResult(): Object` : 서버에서 받은 예측 결과를 분석 결과 화면에서 사용할 데이터로 변환함

#### (3) Description
UploadController 클래스는 이미지 업로드 기능을 담당한다. 사용자가 파일을 선택하거나 카메라로 이미지를 촬영하면 해당 이미지를 백엔드 서버로 전송한다. 서버에서 AI 예측 결과가 반환되면 이를 정리하여 결과 화면으로 전달한다.

---

### 5) ResultController
#### (1) Attributes
* `latestRecord: Object` : 사용자의 가장 최근 분석 기록
* `analysisResult: Object` : AI 모델이 반환한 분석 결과 데이터

#### (2) Methods
* `+ fetchAllItem(): void` : 분석 결과와 연결할 재활용 품목 데이터를 불러옴
* `+ makeDisplayData(): Object` : 분석 결과를 화면에 표시하기 좋은 형태로 변환함

#### (3) Description
ResultController 클래스는 이미지 분석 결과 화면을 담당한다. 사용자의 최근 업로드 기록과 AI 예측 결과를 불러와 쓰레기 종류, 신뢰도, 분리배출 안내 문구 등을 화면에 출력한다. 또한 분석 결과에 맞는 품목 정보와 상세 가이드를 연결하는 역할을 한다.

---

### 6) SearchController
#### (1) Attributes
* `searchInput: String` : 사용자가 입력한 검색어
* `localRecyclingData: Array` : 로컬 또는 서버에서 불러온 재활용 정보 데이터

#### (2) Methods
* `+ performSearch(): void` : 사용자가 입력한 품목명을 기준으로 검색을 수행함
* `+ requestRecyclingInfo(): void` : 백엔드 서버에 재활용 정보 검색 요청을 보냄

#### (3) Description
SearchController 클래스는 재활용 정보 검색 기능을 담당한다. 사용자가 검색창에 품목명을 입력하면 해당 품목과 관련된 재활용 정보를 조회한다. 검색 결과에는 품목명, 분류, 배출 가능 여부, 배출 방법 등이 포함된다.

---

### 7) GuideController
#### (1) Attributes
* `defaultGuideItems: Array` : 기본으로 제공되는 상세 가이드 목록
* `guideData: Array` : Supabase 또는 로컬 데이터에서 불러온 상세 가이드 데이터

#### (2) Methods
* `+ loadGuideItems(): void` : 상세 가이드 데이터를 불러옴
* `+ renderGuide(): void` : 불러온 가이드 데이터를 화면에 출력함

#### (3) Description
GuideController 클래스는 품목별 상세 분리배출 가이드 화면을 담당한다. 각 품목에 대해 세척 방법, 분리 방법, 배출 방법, 주의사항 등을 사용자에게 제공한다. 데이터베이스에서 가이드를 불러오지 못하는 경우 기본 가이드 데이터를 사용할 수 있다.

---

### 8) LocalRulesController
#### (1) Attributes
* `selectedSido: String` : 사용자가 선택한 시·도 정보
* `selectedSigungu: String` : 사용자가 선택한 시·군·구 정보

#### (2) Methods
* `+ fetchRegionRules(): void` : 선택한 지역의 분리배출 규칙을 불러옴
* `+ fetchAdminCorrection(): void` : 관리자가 수정한 지역별 규칙 정보를 불러옴

#### (3) Description
LocalRulesController 클래스는 지역별 분리배출 규칙 조회 기능을 담당한다. 사용자가 시·도와 시·군·구를 선택하면 해당 지역의 배출 요일, 배출장소, 분리배출 규칙을 화면에 표시한다. 관리자 수정 데이터가 존재할 경우 이를 우선적으로 반영할 수 있다.

---

### 9) AdminController
#### (1) Attributes
* `activeView: String` : 현재 관리자가 보고 있는 관리 화면
* `tableMap: Object` : 관리 대상 테이블 정보를 매핑한 데이터

#### (2) Methods
* `+ fetchTable(): void` : 선택한 테이블의 데이터를 불러옴
* `+ addRecord(): void` : 새로운 데이터를 추가함
* `+ editRecord(): void` : 기존 데이터를 수정함
* `+ deleteRecord(): void` : 선택한 데이터를 삭제함

#### (3) Description
AdminController 클래스는 관리자 페이지 기능을 담당한다. 관리자는 재활용 품목, 상세 가이드, 지역별 규칙 등의 데이터를 조회, 추가, 수정, 삭제할 수 destruction 등 데이터베이스의 CRUD 기능을 수행한다. 이 클래스는 SupabaseClient와 연결되어 데이터베이스의 CRUD 기능을 수행한다.

---

### 10) FastAPIServer
#### (1) Attributes
* `app: FastAPI` : 백엔드 서버 애플리케이션 객체
* `guide_map: Object` : 예측 결과와 연결되는 분리배출 가이드 데이터

#### (2) Methods
* `+ predict(file: UploadFile): PredictionResponse` : 업로드된 이미지를 분석하고 예측 결과를 반환함
* `+ search_recycling_info(q: String): Object` : 검색어를 기준으로 재활용 정보를 조회함

#### (3) Description
FastAPIServer 클래스는 백엔드 서버의 중심 역할을 한다. 프론트엔드에서 전달한 이미지를 받아 YOLO 모델에 전달하고, 예측된 쓰레기 종류와 신뢰도를 JSON 형태로 반환한다. 또한 재활용 정보 검색 요청을 받아 RecyclingSearchService를 통해 공공 API 검색 결과를 제공한다.

---

### 11) YOLOModel
#### (1) Attributes
* `MODEL_PATH: String` : 학습된 YOLO 모델 파일 경로
* `IMAGE_SIZE: int` : 모델 입력 이미지 크기
* `class_names: Array` : 모델이 분류할 수 있는 쓰레기 클래스 목록

#### (2) Methods
* `+ model(image: Object): Object` : 입력 이미지를 분석하여 예측 결과를 생성함

#### (3) Description
YOLOModel 클래스는 쓰레기 이미지를 분류하는 AI 모델이다. 외부 AI API를 호출하는 방식이 아니라, 직접 학습한 YOLO 모델 파일인 best.pt를 서버에서 로드하여 이미지를 분석한다. 분석 결과로 예측 클래스, 한글 품목명, 신뢰도, 상위 예측 결과 등을 생성한다.

---

### 12) RecyclingSearchService
#### (1) Attributes
* `API_BASE_URL: String` : 공공 재활용 정보 API의 기본 요청 주소

#### (2) Methods
* `+ search_public_recycling_api(): Object` : 공공 API에 재활용 정보 검색 요청을 보냄
* `+ normalize_recycling_item(): Object` : API 응답 데이터를 시스템에서 사용하기 좋은 형태로 정리함

#### (3) Description
RecyclingSearchService 클래스는 재활용 정보 검색을 담당하는 백엔드 서비스이다. 사용자가 입력한 품목명을 공공 API에 전달하고, 응답받은 데이터를 정리하여 프론트엔드에 반환한다. 불필요한 데이터나 깨진 응답을 필터링하는 역할도 수행할 수 한다.

---

### 13) PublicRecyclingAPI
#### (1) Attributes
* 없음

#### (2) Methods
* `+ request(): Object` : 외부 공공 API에 데이터를 요청함
* `+ response(): Object` : 재활용 정보 검색 결과를 반환함

#### (3) Description
PublicRecyclingAPI 클래스는 시스템 외부에 존재하는 공공데이터 API를 의미한다. 실제 시스템 내부에서 직접 구현한 클래스는 아니지만, 재활용 정보 검색 기능을 위해 백엔드 서버가 요청을 보내는 외부 시스템으로 표현된다.

---

### 14) SupabaseClient
#### (1) Attributes
* `supabaseUrl: String` : Supabase 프로젝트 주소
* `supabaseKey: String` : Supabase 접속 키

#### (2) Methods
* `+ auth.signIn(): void` : 사용자 로그인을 수행함
* `+ auth.signUp(): void` : 사용자 회원가입을 수행함
* `+ from(table).select(): Array` : 특정 테이블의 데이터를 조회함
* `+ insert(): void` : 데이터를 추가함
* `+ update(): void` : 데이터를 수정함
* `+ delete(): void` : 데이터를 삭제함

#### (3) Description
SupabaseClient 클래스는 프론트엔드와 Supabase 데이터베이스를 연결하는 데이터 접근 클래스이다. 사용자 인증, 프로필 관리, 재활용 품목 조회, 상세 가이드 조회, 지역별 규칙 조회, 관리자 CRUD 기능을 수행한다.

---

### 15) UploadRecord
#### (1) Attributes
* `image: String` : 업로드된 이미지 데이터 또는 이미지 경로
* `analysisResult: Object` : AI 분석 결과
* `uploadedAt: Date` : 이미지가 업로드된 시간

#### (2) Methods
* 없음

#### (3) Description
UploadRecord 클래스는 사용자의 이미지 업로드 및 분석 기록을 저장하는 데이터 클래스이다. 사용자가 업로드한 이미지와 해당 이미지에 대한 AI 예측 결과, 업로드 시간을 함께 저장한다. 이를 통해 최근 분석 결과를 다시 확인할 수 있다.

---

### 16) UserProfile
#### (1) Attributes
* `id: String` : 사용자 고유 ID
* `name: String` : 사용자 이름
* `email: String` : 사용자 이메일
* `role: String` : 사용자 권한

#### (2) Methods
* 없음

#### (3) Description
UserProfile 클래스는 사용자 프로필 정보를 저장하는 데이터 클래스이다. Supabase 인증 정보와 연결되며, 사용자의 이름, 이메일, 권한 정보를 포함한다. role 속성을 통해 일반 사용자와 관리자를 구분할 수 있다.

---

### 17) RecyclingItem
#### (1) Attributes
* `model_class: String` : AI 모델이 예측한 클래스명
* `name: String` : 사용자에게 표시되는 품목명
* `category: String` : 재활용 품목의 분류
* `status: String` : 재활용 가능 여부 또는 배출 상태
* `result_guide: String` : 분석 결과 화면에 표시할 안내 문구

#### (2) Methods
* 없음

#### (3) Description
RecyclingItem 클래스는 AI 모델의 예측 결과와 실제 재활용 품목 정보를 연결하는 데이터 클래스이다. 예를 들어 모델이 예측한 클래스명을 한글 품목명, 카테고리, 배출 가능 여부, 배출 안내 문구로 변환하는 데 사용된다.

---

### 18) RecyclingGuide
#### (1) Attributes
* `type: String` : 가이드가 적용되는 품목 유형
* `title: String` : 상세 가이드 제목
* `summary: String` : 분리배출 요약 설명
* `wash: String` : 세척 방법
* `separate: String` : 분리 방법
* `dispose: String` : 배출 방법
* `caution: String` : 주의사항

#### (2) Methods
* 없음

#### (3) Description
RecyclingGuide 클래스는 품목별 상세 분리배출 방법을 저장하는 데이터 클래스이다. 사용자는 이 데이터를 통해 해당 품목을 어떻게 세척하고, 어떤 부분을 분리하며, 어디에 배출해야 하는지 확인할 수 있다.

---

### 19) LocalRule
#### (1) Attributes
* `region: String` : 지역명
* `schedule: String` : 배출 요일 또는 배출 시간
* `place: String` : 배출장소
* `hide_api: boolean` : API 데이터 표시 여부

#### (2) Methods
* 없음

#### (3) Description
LocalRule 클래스는 지역별 분리배출 규칙을 저장하는 데이터 클래스이다. 지역마다 다른 배출 요일, 배출장소, 분리배출 기준을 제공하기 위해 사용된다. 사용자가 선택한 지역에 맞는 정보를 화면에 표시하는 데 활용된다.

---

### 20) PredictionResponse
#### (1) Attributes
* `class: String` : AI 모델이 예측한 클래스명
* `name_ko: String` : 예측 결과의 한글 품목명
* `confidence: float` : 예측 신뢰도
* `certainty: String` : 예측 결과의 확실성 여부
* `guide: String` : 분리배출 안내 문구
* `top3: Array` : 상위 3개 예측 결과

#### (2) Methods
* 없음

#### (3) Description
PredictionResponse 클래스는 FastAPI 서버가 이미지 분석 후 프론트엔드로 반환하는 응답 데이터 클래스이다. 예측된 쓰레기 종류, 한글 이름, 신뢰도, 분리배출 안내, 상위 예측 결과를 포함한다. 프론트엔드는 이 데이터를 이용하여 분석 결과 화면을 구성한다.
