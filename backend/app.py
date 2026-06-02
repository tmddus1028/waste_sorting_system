from io import BytesIO
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

from fastapi import FastAPI, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
MODEL_CANDIDATES = [
    BASE_DIR / "model" / "best.pt",           # backend/model/ (기본 위치)
    PROJECT_DIR / "model" / "best.pt",        # 루트/model/ (fallback)
    BASE_DIR / "best.pt",                     # backend/ (fallback)
]
MODEL_PATH = next((path for path in MODEL_CANDIDATES if path.exists()), MODEL_CANDIDATES[0])
IMAGE_SIZE = 256  # ✅ 수정: 448 → 256 (train.py의 IMGSZ와 일치)

WASTE_RECYCLING_API_BASE_URL = os.getenv(
    "WASTE_RECYCLING_API_BASE_URL",
    "https://apis.data.go.kr/1482000/WasteRecyclingService",
)
WASTE_RECYCLING_API_OPERATION = os.getenv("WASTE_RECYCLING_API_OPERATION", "getItem")
WASTE_RECYCLING_API_KEY = os.getenv(
    "WASTE_RECYCLING_API_KEY",
    "6279caaf59c89a240e41546732eecc1df80a5817c74c1643c87f16ca085beb2a",
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not MODEL_PATH.exists():
    searched_paths = ", ".join(str(path) for path in MODEL_CANDIDATES)
    raise FileNotFoundError(f"best.pt 모델 파일을 찾을 수 없습니다. 확인한 경로: {searched_paths}")

model = YOLO(str(MODEL_PATH))
class_names = list(model.names.values())  # {0: 'cardboard', 1: 'glass', ...} → ['cardboard', ...]

print("모델 파일:", MODEL_PATH)
print("모델 이름: yolo11s-cls")
print("이미지 크기:", IMAGE_SIZE)
print("분류 클래스:", class_names)

guide_map = {
    "biological": {                                                          # ✅ 추가
        "name_ko": "음식물 쓰레기",
        "guide": "물기를 제거한 후 음식물 쓰레기 전용 봉투나 수거함에 배출하세요. 뼈, 조개껍데기, 복숭아씨 등은 일반쓰레기로 배출하세요.",
    },
    "cardboard": {
        "name_ko": "종이박스",
        "guide": "테이프, 운송장, 이물질을 제거하고 납작하게 접어 종이류로 배출하세요.",
    },
    "clothes": {                                                             # ✅ 추가
        "name_ko": "의류",
        "guide": "깨끗한 상태라면 의류 수거함에 기증하세요. 오염되거나 파손된 경우 종량제 봉투에 담아 일반쓰레기로 배출하세요.",
    },
    "glass": {
        "name_ko": "유리",
        "guide": "내용물을 비우고 헹군 뒤 유리류로 배출하세요. 깨진 유리는 신문지 등에 감싸 일반쓰레기로 배출하세요.",
    },
    "metal": {
        "name_ko": "금속/캔",
        "guide": "내용물을 비우고 헹군 뒤 가능한 압착하여 캔류 또는 금속류로 배출하세요.",
    },
    "paper": {
        "name_ko": "종이",
        "guide": "물기와 이물질을 제거하고 종이류로 배출하세요. 코팅지나 영수증은 일반쓰레기로 배출하는 경우가 많습니다.",
    },
    "plastic": {
        "name_ko": "플라스틱",
        "guide": "내용물을 비우고 헹군 뒤 라벨과 뚜껑을 가능한 분리하여 플라스틱류로 배출하세요.",
    },
    "shoes": {                                                               # ✅ 추가
        "name_ko": "신발",
        "guide": "깨끗한 신발은 의류 수거함에 넣어도 됩니다. 오래되거나 파손된 신발은 종량제 봉투에 담아 일반쓰레기로 배출하세요.",
    },
    "trash": {
        "name_ko": "일반쓰레기",
        "guide": "재활용이 어려운 쓰레기로 판단됩니다. 종량제 봉투에 담아 배출하세요.",
    },
}


LOCAL_RECYCLING_GUIDE = [
    {
        "keywords": ["paper cup", "cup", "paper", "종이컵", "컵", "종이"],
        "title": "종이컵",
        "category": "종이",
        "status": "코팅 여부 확인",
        "recyclable": False,
        "description": "플라스틱 코팅이 된 종이컵은 재활용이 어려운 경우가 많아 일반쓰레기로 배출합니다. 코팅이 없는 깨끗한 종이는 종이류로 분리배출하세요.",
    },
    {
        "keywords": ["plastic", "pet", "bottle", "페트병", "플라스틱", "병"],
        "title": "페트병",
        "category": "플라스틱",
        "status": "재활용 가능",
        "recyclable": True,
        "description": "내용물을 비우고 헹군 뒤 라벨을 제거하고 압착해서 플라스틱류로 배출하세요.",
    },
    {
        "keywords": ["can", "metal", "aluminum", "steel", "캔", "금속", "알루미늄"],
        "title": "캔/금속 용기",
        "category": "금속",
        "status": "재활용 가능",
        "recyclable": True,
        "description": "내용물을 비우고 헹군 뒤 가능한 경우 압착해서 캔류 또는 금속류로 배출하세요.",
    },
    {
        "keywords": ["glass", "bottle", "유리", "유리병"],
        "title": "유리병",
        "category": "유리",
        "status": "재활용 가능",
        "recyclable": True,
        "description": "내용물을 비우고 헹군 뒤 유리류로 배출하세요. 깨진 유리는 다치지 않도록 포장해 지역 기준에 따라 배출하세요.",
    },
    {
        "keywords": ["cardboard", "box", "paper box", "박스", "종이박스", "상자"],
        "title": "종이박스",
        "category": "종이",
        "status": "재활용 가능",
        "recyclable": True,
        "description": "테이프, 송장, 이물질을 제거하고 납작하게 접어서 종이류로 배출하세요.",
    },
    {
        "keywords": ["food", "trash", "general", "음식물", "일반쓰레기", "쓰레기"],
        "title": "일반쓰레기",
        "category": "쓰레기",
        "status": "재활용 불가",
        "recyclable": False,
        "description": "음식물, 액체, 이물질로 오염되었거나 여러 재질이 분리되지 않는 품목은 일반쓰레기로 배출하는 경우가 많습니다.",
    },
]


def make_recycling_api_url() -> str:
    base_url = WASTE_RECYCLING_API_BASE_URL.rstrip("/")
    operation = WASTE_RECYCLING_API_OPERATION.strip("/")
    return f"{base_url}/{operation}" if operation else base_url


def fetch_url_text(url: str, params: dict) -> str:
    request_url = f"{url}?{urlencode(params)}"
    print("공공데이터 API 최종 요청 URL:", request_url)

    request = Request(request_url, headers={"User-Agent": "WasteSortingSystem/1.0"})

    with urlopen(request, timeout=8) as response:
        text = response.read().decode("utf-8", errors="replace")
        print("공공데이터 API 응답 내용:", text[:1000])
        return text


def flatten_dict(value, prefix=""):
    if isinstance(value, dict):
        flattened = {}
        for key, nested_value in value.items():
            nested_key = f"{prefix}.{key}" if prefix else str(key)
            flattened.update(flatten_dict(nested_value, nested_key))
        return flattened

    if isinstance(value, list):
        flattened = {}
        for index, nested_value in enumerate(value):
            nested_key = f"{prefix}.{index}" if prefix else str(index)
            flattened.update(flatten_dict(nested_value, nested_key))
        return flattened

    return {prefix: value}


def find_items(value):
    if isinstance(value, dict):
        for key in ("item", "items", "row", "data", "list"):
            if key in value:
                found = find_items(value[key])
                if found:
                    return found

        if any(not isinstance(child, (dict, list)) for child in value.values()):
            return [value]

        items = []
        for child in value.values():
            items.extend(find_items(child))
        return items

    if isinstance(value, list):
        items = []
        for child in value:
            items.extend(find_items(child))
        return items

    return []


def parse_xml_items(text: str):
    root = ET.fromstring(text)
    item_nodes = root.findall(".//item")
    if not item_nodes:
        item_nodes = root.findall(".//row")

    items = []
    for node in item_nodes:
        item = {}
        for child in list(node):
            item[child.tag] = (child.text or "").strip()
        if item:
            items.append(item)
    return items


def pick_first(flattened: dict, keywords: list[str]) -> str:
    for key, value in flattened.items():
        lowered_key = key.lower()
        if any(keyword in lowered_key for keyword in keywords) and value not in (None, ""):
            return str(value)
    return ""


DEFAULT_RECYCLING_DESCRIPTION = "오염 여부와 재질에 따라 배출 방법이 달라질 수 있습니다."

MEANINGLESS_RECYCLING_VALUES = {
    "",
    "{}",
    "[]",
    "api result",
    "recycling information",
    "normal service",
}


def clean_recycling_text(value) -> str:
    return str(value or "").strip()


def is_meaningless_recycling_text(value) -> bool:
    text = clean_recycling_text(value)
    normalized = text.lower()

    if normalized in MEANINGLESS_RECYCLING_VALUES:
        return True

    if normalized.startswith("{") and normalized.endswith("}"):
        return True

    if normalized.startswith("[") and normalized.endswith("]"):
        return True

    return False


def normalize_match_text(value) -> str:
    return clean_recycling_text(value).replace(" ", "").lower()


def normalize_recycling_status(title: str, category: str, method: str, raw_text: str) -> tuple[str, bool | None]:
    text = f"{title} {category} {method} {raw_text}"

    if any(keyword in text for keyword in ("종량제", "종량제봉투", "재활용 불가", "재활용 불가능", "불가능")):
        return "재활용 불가능", False

    if any(keyword in text for keyword in ("재활용 가능", "분리배출", "재활용")):
        return "재활용 가능", True

    return "확인 필요", None


def normalize_recycling_item(item: dict) -> dict:
    flattened = flatten_dict(item)

    title = pick_first(flattened, [
        "name", "nm", "item", "waste", "wste", "prd", "title",
        "품목", "품목명"
    ])

    category = pick_first(flattened, [
        "category", "ctgry", "type", "kind", "clsf", "se",
        "분류", "종류"
    ])

    method = pick_first(flattened, [
        "method", "mthd", "guide", "way", "desc", "content", "cn",
        "bag", "place", "배출", "방법", "장소", "봉투",
        "dispos", "dispose", "discharge", "throw"
    ])

    raw_text = json.dumps(item, ensure_ascii=False)

    title = clean_recycling_text(title)
    category = clean_recycling_text(category)
    method = clean_recycling_text(method)

    status, recyclable = normalize_recycling_status(title, category, method, raw_text)

    if is_meaningless_recycling_text(method):
        description = DEFAULT_RECYCLING_DESCRIPTION
    else:
        description = method

    return {
        "title": title,
        "category": category,
        "status": status,
        "recyclable": recyclable,
        "description": description,
        "raw": item,
    }


def is_valid_recycling_result(item: dict, query: str) -> bool:
    title = clean_recycling_text(item.get("title"))
    category = clean_recycling_text(item.get("category"))
    description = clean_recycling_text(item.get("description"))

    if not title:
        return False

    if title.lower() in ("api result", "recycling information", "result", "header"):
        return False

    if is_meaningless_recycling_text(title):
        return False

    if is_meaningless_recycling_text(description):
        return False

    # "API에서 상세 배출 방법을 제공하지 않았습니다."는 정상 결과의 기본 안내문이므로 허용
    if description == DEFAULT_RECYCLING_DESCRIPTION:
        pass

    normalized_query = normalize_match_text(query)

    # 이상한 검색어가 API 메타데이터 때문에 결과처럼 뜨는 것 방지
    if normalized_query:
        searchable_text = normalize_match_text(
            " ".join([title, category, description])
        )

        if normalized_query not in searchable_text:
            return False

    return True


def search_local_recycling_guide(query: str):
    normalized_query = query.strip().lower()
    if not normalized_query:
        return LOCAL_RECYCLING_GUIDE[:3]

    return [
        item
        for item in LOCAL_RECYCLING_GUIDE
        if any(keyword.lower() in normalized_query or normalized_query in keyword.lower() for keyword in item["keywords"])
    ]


def search_public_recycling_api(query: str):
    if not WASTE_RECYCLING_API_KEY:
        return [], "API key is missing."

    params = {
        "serviceKey": WASTE_RECYCLING_API_KEY,
        "pageNo": 1,
        "numOfRows": 10,
        "_type": "json",
        "type": "json",
        "keyword": query,
        "searchKeyword": query,
        "searchWrd": query,
        "itemNm": query,
        "itemName": query,
        "wasteNm": query,
        "wasteName": query,
    }

    try:
        text = fetch_url_text(make_recycling_api_url(), params)
        stripped_text = text.lstrip()

        if stripped_text.startswith("{") or stripped_text.startswith("["):
            payload = json.loads(text)
            raw_items = find_items(payload)
        else:
            raw_items = parse_xml_items(text)

        normalized_items = [normalize_recycling_item(item) for item in raw_items]

        valid_items = [
            item
            for item in normalized_items
            if is_valid_recycling_result(item, query)
        ]

        return valid_items, ""

    except HTTPError as error:
        return [], f"Public API HTTP error: {error.code}"
    except URLError as error:
        return [], f"Public API connection error: {error.reason}"
    except Exception as error:
        return [], f"Public API parse error: {error}"


@app.get("/")
def home():
    return {
        "message": "Waste Sorting AI Server is running",
        "model_path": str(MODEL_PATH),
        "model_name": "yolo11s-cls",
        "image_size": IMAGE_SIZE,
        "classes": class_names,
    }


@app.get("/recycling/search")
def search_recycling_info(q: str = Query("", max_length=100)):
    query = q.strip()
    api_results, api_error = search_public_recycling_api(query)

    if api_results:
        return {
            "query": query,
            "source": "public_api",
            "results": api_results,
        }

    return {
        "query": query,
        "source": "public_api",
        "api_error": api_error,
        "api_url": make_recycling_api_url(),
        "results": [],
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    results = model(image, imgsz=IMAGE_SIZE, verbose=False)
    probs = results[0].probs

    predicted_index = int(probs.top1)
    confidence_percent = round(float(probs.top1conf) * 100, 2)
    predicted_class = model.names[predicted_index]

    # Top 3 후보 생성
    top3 = [
        {
            "class": model.names[int(probs.top5[i])],
            "name_ko": guide_map.get(model.names[int(probs.top5[i])], {}).get("name_ko", model.names[int(probs.top5[i])]),
            "confidence": round(float(probs.data[int(probs.top5[i])]) * 100, 2),
        }
        for i in range(3)
    ]

    guide_info = guide_map.get(str(predicted_class).lower(), {
        "name_ko": predicted_class,
        "guide": "분리배출 정보를 찾을 수 없습니다.",
    })

    # 신뢰도에 따라 메시지 분기
    if confidence_percent >= 80:
        # 높은 신뢰도: 확정 결과
        certainty = "high"
        message = f"{guide_info['name_ko']}로 분류되었습니다."
    elif confidence_percent >= 50:
        # 중간 신뢰도: 가능성 안내
        certainty = "medium"
        message = f"{guide_info['name_ko']}일 가능성이 높습니다. 아래 후보를 참고해 주세요."
    else:
        # 낮은 신뢰도: 추정 안내
        certainty = "low"
        message = f"{guide_info['name_ko']}로 추정되지만 확실하지 않습니다. 물체가 잘 보이도록 다시 촬영해 보세요."

    return {
        "class": predicted_class,
        "name_ko": guide_info["name_ko"],
        "confidence": confidence_percent,
        "certainty": certainty,       # "high" | "medium" | "low"
        "message": message,
        "guide": guide_info["guide"],
        "top3": top3,                 # 상위 3개 후보 항상 포함
    }
