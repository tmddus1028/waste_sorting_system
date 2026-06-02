document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
        || window.WASTE_API_BASE_URL    
        || localStorage.getItem('wasteApiBaseUrl')
        || 'http://127.0.0.1:8000';

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResult = document.getElementById('searchResult');
    const DEFAULT_RESULT_DESCRIPTION = '오염 여부와 재질에 따라 배출 방법이 달라질 수 있습니다.';

    if (!searchInput || !searchButton || !searchResult) {
        return;
    }

    const localRecyclingData = {
        "종이컵": [
            {
                name: "종이컵 (코팅된 종이)",
                recyclable: false,
                description: "코팅이 되어있는 종이컵은 재활용이 불가능하므로 일반쓰레기로 배출합니다.",
                detailType: "paper_cup"
            },
            {
                name: "종이컵 (코팅 안 된 종이)",
                recyclable: true,
                description: "코팅이 되어있지 않은 종이컵은 종이류로 배출할 수 있습니다.",
                detailType: "paper_cup"
            }
        ],
        "페트병": [
            {
                name: "페트병",
                recyclable: true,
                description: "내용물을 비우고 헹군 뒤 라벨을 제거하고 압착해서 플라스틱류로 배출합니다.",
                detailType: "plastic"
            }
        ],
        "비닐": [
            {
                name: "비닐",
                recyclable: true,
                description: "비닐은 내용물을 비우고 이물질을 제거한 뒤 비닐류로 분리배출합니다.",
                detailType: "vinyl"
            }
        ],
        "캔": [
            {
                name: "캔",
                recyclable: true,
                description: "내용물을 비우고 헹군 뒤 가능한 경우 압착해서 캔류 또는 금속류로 배출합니다.",
                detailType: "can"
            }
        ],
        "종이박스": [
            {
                name: "종이박스",
                recyclable: true,
                description: "테이프, 송장, 이물질을 제거한 뒤 납작하게 접어서 종이류로 배출합니다.",
                detailType: "paper"
            }
        ],
        "박스": [
            {
                name: "종이박스",
                recyclable: true,
                description: "테이프, 송장, 이물질을 제거한 뒤 납작하게 접어서 종이류로 배출합니다.",
                detailType: "paper"
            }
        ]
    };

    const fallbackData = [
        {
            keywords: ['종이', 'paper'],
            name: '종이류',
            recyclable: true,
            description: '물기와 이물질을 제거한 뒤 종이류로 분리배출합니다.',
            detailType: 'paper'
        },
        {
            keywords: ['플라스틱', 'plastic'],
            name: '플라스틱',
            recyclable: true,
            description: '내용물을 비우고 헹군 뒤 라벨이나 다른 재질을 제거하여 플라스틱류로 배출합니다.',
            detailType: 'plastic'
        },
        {
            keywords: ['유리', '유리병', 'glass'],
            name: '유리병',
            recyclable: true,
            description: '내용물을 비우고 헹군 뒤 유리류로 배출합니다. 깨진 유리는 포장 후 지역 기준에 따라 배출합니다.',
            detailType: 'glass_bottle'
        }
    ];

    const validGuideTypes = [
        'paper_cup',
        'paper',
        'plastic',
        'vinyl',
        'can',
        'glass_bottle',
        'food_waste',
        'general_waste'
    ];

    const guideTargetMap = {
        "종이": "paper",
        "종이류": "paper",
        "신문지": "paper",
        "책": "paper",
        "노트": "paper",
        "종이박스": "paper",
        "박스": "paper",
        "골판지": "paper",

        "종이컵": "paper_cup",
        "종이컵(코팅된종이)": "paper_cup",
        "종이컵(코팅안된종이)": "paper_cup",

        "페트병": "plastic",
        "투명페트병": "plastic",
        "플라스틱병": "plastic",
        "플라스틱용기": "plastic",
        "플라스틱": "plastic",

        "비닐": "vinyl",
        "비닐봉지": "vinyl",
        "비닐포장재": "vinyl",

        "캔": "can",
        "알루미늄캔": "can",
        "철캔": "can",
        "음료수캔": "can",
        "통조림캔": "can",

        "유리병": "glass_bottle",
        "유리": "glass_bottle",
        "음료수병": "glass_bottle",

        "음식물쓰레기": "food_waste",
        "음식물": "food_waste"
    };

    const guideExcludeKeywords = [
        "종이테이프",
        "종이 테이프",
        "종이컵라면",
        "종이 컵라면",
        "컵라면",
        "음수대용 종이컵",
        "영수증",
        "코팅지",
        "벽지",
        "기름종이",
        "사진",
        "휴지",
        "물티슈",

        "비닐노끈",
        "비닐 노끈",
        "비닐끈",
        "비닐 라벨",
        "라벨",
        "오염된 비닐",

        "플라스틱 장난감",
        "장난감",
        "칫솔",
        "빨대",
        "일회용 숟가락",
        "일회용 포크",

        "캔뚜껑",
        "캔 뚜껑",
        "부탄가스",
        "스프레이",

        "깨진유리",
        "깨진 유리",
        "유리조각",
        "유리 조각",
        "거울",
        "도자기",
        "사기그릇",

        "신발",
        "스키신발",
        "운동화",
        "구두",
        "슬리퍼",

        "건전지",
        "배터리",
        "보조배터리",
        "폐건전지",
        "형광등",
        "전구",

        "의류",
        "옷",
        "가방",
        "이불",
        "베개",

        "대형폐기물",
        "소형가전",
        "전자제품",
        "폐의약품",
        "약"
    ];

   function getGuideTypeFromSearchResult(item) {
    if (!item || item.isNotFound) return '';

    const explicitType = String(item.detailType || '').trim();
    if (validGuideTypes.includes(explicitType)) {
        return explicitType;
    }

    const exactType = getExactGuideType(item);
    if (validGuideTypes.includes(exactType)) {
        return exactType;
    }

    return '';
}

   function canShowDetailGuide(item) {
    return Boolean(getGuideTypeFromSearchResult(item));
}

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalizeKeyword(value) {
        return String(value || '')
            .trim()
            .replace(/\s+/g, '')
            .toLowerCase();
    }

    function normalizeItemName(value) {
        return String(value || '')
            .trim()
            .replace(/\s+/g, '')
            .replace(/[()]/g, '')
            .toLowerCase();
    }

    function isMetadataText(value) {
        const text = String(value || '').trim();

        return !text
            || text.includes('공공데이터')
            || text.includes('resultCode')
            || text.includes('resultMsg')
            || text.includes('NORMAL SERVICE')
            || text.includes('totalCount')
            || text.includes('pageNo')
            || text.includes('numOfRows');
    }

    function isRawJsonText(value) {
        const text = String(value || '').trim();
        return (text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'));
    }

    function isStatusOnlyText(value) {
        const text = String(value || '').trim().replace(/\s+/g, '');
        return /^(재활용폐기물|재활용가능|재활용불가능|재활용불가|일반쓰레기|종량제)$/.test(text);
    }

    function isMeaninglessDescription(value) {
        const text = String(value || '').trim();
        const loweredText = text.toLowerCase();

        return !text
            || loweredText === 'api result'
            || loweredText === 'recycling information'
            || text === '{}'
            || text === '[]';
    }

    function isInvalidResultName(value) {
        const text = String(value || '').trim();
        const loweredText = text.toLowerCase();

        return !text
            || loweredText === 'api result'
            || loweredText === 'recycling information'
            || loweredText === 'result'
            || loweredText === 'header';
    }

    function normalizeResultDescription(value) {
        const text = String(value || '').trim();
        if (
            !text ||
            text === 'API result' ||
            text === 'Recycling information' ||
            text === 'API에서 상세 배출 방법을 제공하지 않았습니다.' ||
            text === '세부 배출 방법 정보가 부족합니다. 거주 지역의 배출 기준을 추가로 확인해주세요.'
        ) {
            return DEFAULT_RESULT_DESCRIPTION;
        }
        return text;
    }

    function normalizeResultStatus(item) {
        const status = String(item?.status || '').trim();

        if (status === '재활용 가능' || status === '재활용 불가능' || status === '확인 필요') {
            return status;
        }

        if (status.includes('불가능') || status.includes('불가') || status.includes('종량제')) {
            return '재활용 불가능';
        }

        if (status.includes('재활용') || status.includes('분리배출')) {
            return '재활용 가능';
        }

        if (item?.recyclable === true) {
            return '재활용 가능';
        }

        if (item?.recyclable === false) {
            return '재활용 불가능';
        }

        return '확인 필요';
    }

    function getFirstValidValue(item, keys, options) {
        const rejectStatusOnly = options?.rejectStatusOnly === true;

        for (const key of keys) {
            const value = item?.[key];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== '' &&
                !isMetadataText(value) &&
                !isRawJsonText(value) &&
                (!rejectStatusOnly || !isStatusOnlyText(value))
            ) {
                return String(value).trim();
            }
        }

        return '';
    }

   
    function getLocalRecyclingResults(query) {
        const normalizedQuery = normalizeKeyword(query);

        if (!normalizedQuery) {
            return [];
        }

        const matchedKey = Object.keys(localRecyclingData).find(function (key) {
            return normalizeKeyword(key) === normalizedQuery;
        });

        return matchedKey ? localRecyclingData[matchedKey] : [];
    }

    function getFallbackResults(query) {
        const normalizedQuery = normalizeKeyword(query);

        if (!normalizedQuery) {
            return [];
        }

        return fallbackData.filter(function (item) {
            return item.keywords.some(function (keyword) {
                const normalizedKeyword = normalizeKeyword(keyword);
                return normalizedKeyword === normalizedQuery;
            });
        });
    }

    function isRelatedToQuery(item, query) {
        const normalizedQuery = normalizeKeyword(query);
        const title = normalizeKeyword(item.name);

        if (!normalizedQuery || !title) {
            return false;
        }

        return title.includes(normalizedQuery) || normalizedQuery.includes(title);
    }

   function inferRecyclableValue(item) {
    if (item.recyclable === true || item.recyclable === false) {
        return item.recyclable;
    }

    const text = [
        item.status,
        item.statusLabel,
        item.wasteType,
        item.waste_type,
        item.disposalType,
        item.disposal_type,
        item.category,
        item.description,
        item.method,
        item.guide,
        item.content,
        item.contents,
        item.title,
        item.name,
        item.itemName,
        item.품목명,
        item.폐기물명,
        item.분류,
        item.배출방법,
        item.분리배출방법,
        item.배출장소,
        item.수거장소
    ].join(' ');

    if (/(재활용\s*불가|재활용\s*불가능|일반\s*쓰레기|일반쓰레기|종량제|대형폐기물|배출\s*불가|불가능)/.test(text)) {
        return false;
    }

    if (/(재활용폐기물|재활용\s*가능|재활용|분리배출|종이류|플라스틱류|캔류|금속류|유리류|비닐류|전용수거함|수거함)/.test(text)) {
        return true;
    }

    return null;
}

    function getExactGuideType(item) {
    const itemName =
        item?.name ||
        item?.title ||
        item?.itemName ||
        item?.item_name ||
        item?.wasteName ||
        item?.category ||
        '';

    const normalizedName = normalizeItemName(itemName);

    if (!normalizedName) {
        return 'unknown';
    }

    const hasExcludedKeyword = guideExcludeKeywords.some(function (keyword) {
        return normalizedName.includes(normalizeItemName(keyword));
    });

    if (hasExcludedKeyword) {
        return 'unknown';
    }

    for (const [targetName, guideType] of Object.entries(guideTargetMap)) {
        if (normalizedName === normalizeItemName(targetName)) {
            return guideType;
        }
    }

    return 'unknown';
}
  
    function renderLoading() {
        searchResult.innerHTML = '<p class="empty-search">검색 중입니다...</p>';
    }

    function renderMessage(message) {
        searchResult.innerHTML = `<p class="empty-search">${escapeHtml(message)}</p>`;
    }

    function renderNotFound(query) {
        searchResult.innerHTML = `
            <article class="recycling-result-card not-found-card">
                <div class="result-content">
                    <h3 class="result-title">재활용 정보를 찾을 수 없습니다.</h3>
                    <p class="result-description">
                        "${escapeHtml(query)}"에 대한 분리배출 정보를 찾지 못했습니다.
                        검색어를 다시 입력하거나 주요 품목명을 입력해주세요.
                    </p>
                </div>
            </article>
        `;
    }

    function renderNotFound(query) {
        searchResult.innerHTML = `
            <article class="recycling-result-card not-found-card">
                <div class="result-content">
                    <h3 class="result-title">재활용 정보를 찾을 수 없습니다.</h3>
                    <p class="result-description">
                        "${escapeHtml(query)}"에 대한 분리배출 정보를 찾지 못했습니다.
                        검색어를 다시 입력하거나 주요 품목명을 입력해주세요.
                    </p>
                </div>
            </article>
        `;
    }

    function normalizeDisplayItem(item, query) {
        if (!item || typeof item !== 'object') {
            return null;
        }

        const name = getFirstValidValue(item, [
            'name',
            'title',
            'itemName',
            'item_name',
            'wasteName',
            'waste_type',
            'category'
        ]);

        if (isInvalidResultName(name)) {
            return null;
        }

       const description = getFirstValidValue(item, [
        'description',
        'method',
        'guide',
        'result_guide',
        'disposalMethod',
        'disposal_method',
        'content',
        'contents'
    ], { rejectStatusOnly: true }) || DEFAULT_RESULT_DESCRIPTION;

        const safeDescription = normalizeResultDescription(description);

        const displayItem = {
            ...item,
            name,
            description: safeDescription,
            status: normalizeResultStatus(item),
            recyclable: inferRecyclableValue(item)
        };

        displayItem.detailType = getGuideTypeFromSearchResult(displayItem);

        return displayItem;
    }

    function renderResults(results, query) {
    const displayResults = (results || [])
        .map(function (item) {
            return normalizeDisplayItem(item, query);
        })
        .filter(Boolean);

    if (displayResults.length === 0) {
        renderNotFound(query);
        return;
    }

    searchResult.innerHTML = displayResults.map(function (item) {
        let statusText = '확인 필요';
        let statusClass = 'unknown';

        if (item.recyclable === true) {
            statusText = '재활용 가능';
            statusClass = 'possible';
        }

        if (item.recyclable === false) {
            statusText = '재활용 불가능';
            statusClass = 'impossible';
        }

        statusText = normalizeResultStatus(item);
        statusClass = statusText === '재활용 가능'
            ? 'possible'
            : statusText === '재활용 불가능'
                ? 'impossible'
                : 'unknown';

        const detailType = getGuideTypeFromSearchResult(item);
        const canShowDetailLink = Boolean(detailType);

        const detailLinkHtml = canShowDetailLink
            ? `<a class="recycling-detail-link" href="guide-detail.html?type=${encodeURIComponent(detailType)}&item=${encodeURIComponent(item.name)}">상세가이드 보기</a>`
            : '';

        return `
            <article class="recycling-result-card">
                <div class="result-content">
                    <h3 class="result-title">${escapeHtml(item.name)}</h3>
                    <p class="recycle-status ${statusClass}">${statusText}</p>
                    <p class="result-description">${escapeHtml(item.description)}</p>
                    ${detailLinkHtml}
                </div>
            </article>
        `;
    }).join('');
}

   async function requestRecyclingInfo(query) {
    const url = `${API_BASE_URL}/recycling/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);    
    if (!response.ok) throw new Error(`응답 오류: ${response.status}`);
    const data = await response.json();
    return data;
}
   function extractApiResults(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        return [data];
    }

    return [];
}

   async function performSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        renderMessage('검색할 품목을 입력하세요.');
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = '검색 중';
    renderLoading();

    try {
        const localResults = getLocalRecyclingResults(query);

        if (localResults.length > 0) {
            console.log('로컬 데이터 사용:', localResults);
            renderResults(localResults, query);
            return;
        }

        const data = await requestRecyclingInfo(query);
        console.log('API 원본 응답:', data);

        const backendResults = extractApiResults(data)
            .map(function(item) {
                return normalizeBackendItem(item, query);
            })
            .filter(Boolean);

        if (backendResults.length > 0) {
            renderResults(backendResults);
            return;
        }

        renderNotFound(query);
    } catch (error) {
        console.error('재활용 정보 검색 오류:', error);
        renderNotFound(query);
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = '검색';
    }
}

function normalizeBackendItem(item, query) {
    if (!item || typeof item !== 'object') return null;
    const pickedName = getFirstValidValue(item, ['title']);
    const hasResultContent = getFirstValidValue(item, [
        'description',
        'method',
        'guide',
        'result_guide',
        'disposalMethod',
        'disposal_method',
        'content',
        'contents',
        'status'
    ], { rejectStatusOnly: true });
    const name = pickedName;
    if (isInvalidResultName(name)) return null;

    let recyclable = item.recyclable;
    if (recyclable === null || recyclable === undefined) {
        const text = [item.status, item.category, item.description].join(' ');
        if (/(재활용\s*불가|일반\s*쓰레기|종량제)/.test(text)) recyclable = false;
        else if (/(재활용|분리배출|종이류|플라스틱류|캔류|금속류|유리류)/.test(text)) recyclable = true;
    }

   const description = getFirstValidValue(item, [
    'description',
    'method',
    'guide',
    'result_guide',
    'disposalMethod',
    'disposal_method',
    'content',
    'contents'
], { rejectStatusOnly: true }) || DEFAULT_RESULT_DESCRIPTION;

    const displayItem = {
        ...item,
        name,
        recyclable,
        status: normalizeResultStatus({ ...item, recyclable }),
        description: normalizeResultDescription(description)
    };
    const detailType = getGuideTypeFromSearchResult(displayItem);
    return { ...displayItem, detailType };
}

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    renderMessage('검색할 품목을 입력하세요.');
});
