document.addEventListener('DOMContentLoaded', function() {
    const sidoSelect = document.getElementById('sidoSelect');
    const sigunguSelect = document.getElementById('sigunguSelect');
    const collectionDays = document.getElementById('collectionDays');
    const disposalTime = document.getElementById('disposalTime');
    const disposalLocation = document.getElementById('disposalLocation');
    const apiStatus = document.getElementById('apiStatus');

    const API_ORIGIN = 'https://apis.data.go.kr/1741000/household_waste_info/info';
    const SERVICE_KEY = '6279caaf59c89a240e41546732eecc1df80a5817c74c1643c87f16ca085beb2a';

    const regionData = {
        "서울특별시": [
            "강남구", "강동구", "강북구", "강서구", "관악구", "광진구",
            "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구",
            "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
            "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
        ],
        "부산광역시": [
            "강서구", "금정구", "기장군", "남구", "동구", "동래구",
            "부산진구", "북구", "사상구", "사하구", "서구", "수영구",
            "연제구", "영도구", "중구", "해운대구"
        ],
        "대구광역시": [
            "군위군", "남구", "달서구", "달성군", "동구", "북구",
            "서구", "수성구", "중구"
        ],
        "인천광역시": [
            "강화군", "계양구", "남동구", "동구", "미추홀구", "부평구",
            "서구", "연수구", "옹진군", "중구"
        ],
        "광주광역시": [
            "광산구", "남구", "동구", "북구", "서구"
        ],
        "대전광역시": [
            "대덕구", "동구", "서구", "유성구", "중구"
        ],
        "울산광역시": [
            "남구", "동구", "북구", "울주군", "중구"
        ],
        "경기도": [
            "수원시", "성남시", "고양시", "용인시", "부천시", "안산시",
            "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시",
            "파주시", "김포시", "광명시", "광주시", "군포시", "오산시",
            "이천시", "안성시", "구리시", "의왕시", "하남시", "양주시",
            "여주시", "동두천시", "과천시", "가평군", "양평군", "연천군"
        ],
        "충청북도": [
            "청주시", "충주시", "제천시", "보은군", "옥천군", "영동군",
            "증평군", "진천군", "괴산군", "음성군", "단양군"
        ],
        "충청남도": [
            "천안시", "공주시", "보령시", "아산시", "서산시", "논산시",
            "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군",
            "홍성군", "예산군", "태안군"
        ],
        "전라북도": [
            "전주시", "군산시", "익산시", "정읍시", "남원시", "김제시",
            "완주군", "진안군", "무주군", "장수군", "임실군", "순창군",
            "고창군", "부안군"
        ],
        "전라남도": [
            "목포시", "여수시", "순천시", "나주시", "광양시", "담양군",
            "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군",
            "강진군", "해남군", "영암군", "무안군", "함평군", "영광군",
            "장성군", "완도군", "진도군", "신안군"
        ],
        "경상북도": [
            "포항시", "경주시", "김천시", "안동시", "구미시", "영주시",
            "영천시", "상주시", "문경시", "경산시", "의성군", "청송군",
            "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군",
            "예천군", "봉화군", "울진군", "울릉군"
        ],
        "경상남도": [
            "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시",
            "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군",
            "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"
        ],
        "제주특별자치도": [
            "제주시", "서귀포시"
        ]
    };

    const fallbackData = {
        days: [
            { day: '월', item: '일반쓰레기' },
            { day: '화', item: '플라스틱' },
            { day: '수', item: '종이류' },
            { day: '목', item: '유리·캔' },
            { day: '금', item: '음식물쓰레기' }
        ],
        time: '저녁 8시 ~ 다음날 새벽 5시',
        location: '내 집·내 점포 앞, 지정된 장소에 배출'
    };

    function populateSidoOptions() {
        sidoSelect.innerHTML = '<option value="">시/도를 선택하세요</option>'
            + Object.keys(regionData).map(function(sido) {
                return `<option value="${sido}">${sido}</option>`;
            }).join('');
    }

    function populateSigunguOptions(sido) {
        sigunguSelect.innerHTML = '<option value="">시/군/구를 선택하세요</option>';

        if (!sido || !regionData[sido]) {
            sigunguSelect.disabled = true;
            return;
        }

        regionData[sido].forEach(function(sigungu) {
            const option = document.createElement('option');
            option.value = sigungu;
            option.textContent = sigungu;
            sigunguSelect.appendChild(option);
        });

        sigunguSelect.disabled = false;
    }

    function pickField(item, names) {
        for (const name of names) {
            if (item[name] !== undefined && item[name] !== null && String(item[name]).trim() !== '') {
                return String(item[name]).trim();
            }
        }
        return '';
    }

    function getLocalRuleBody(data) {
        return data?.response?.body || data?.body || data || {};
    }

    function getLocalRuleTotalCount(data) {
        const body = getLocalRuleBody(data);
        const totalCount = body?.totalCount ?? data?.totalCount;

        if (totalCount === undefined || totalCount === null || totalCount === '') {
            return null;
        }

        const parsedCount = Number(totalCount);
        return Number.isNaN(parsedCount) ? null : parsedCount;
    }

    function extractLocalRuleItems(data) {
        const totalCount = getLocalRuleTotalCount(data);

        if (totalCount === 0) {
            return [];
        }

        let items =
            data?.response?.body?.items?.item ||
            data?.body?.items?.item ||
            data?.items?.item ||
            data?.items ||
            [];

        if (!Array.isArray(items)) {
            items = items ? [items] : [];
        }

        return items.filter(function(item) {
            if (!item || typeof item !== 'object') return false;

            const text = JSON.stringify(item);
            if ('pageNo' in item) return false;
            if ('numOfRows' in item) return false;
            if ('totalCount' in item) return false;
            if ('items' in item) return false;
            if (text.includes('resultCode')) return false;
            if (text.includes('resultMsg')) return false;
            if (text.includes('NORMAL SERVICE')) return false;

            return true;
        });
    }

    function normalizeItems(payload) {
        return extractLocalRuleItems(payload);
    }

    function compactText(values, fallback) {
        const uniqueValues = [...new Set(values.filter(Boolean))];
        return uniqueValues.length > 0 ? uniqueValues.join(' / ') : fallback;
    }

    function simplifyDayLabel(dayText) {
        const normalizedText = String(dayText || '').replace(/\+/g, '·');
        if (normalizedText.includes('·')) {
            return normalizedText;
        }

        const dayMap = [
            ['월', /월/], ['화', /화/], ['수', /수/], ['목', /목/], ['금', /금/], ['토', /토/], ['일', /일/]
        ];
        const foundDays = dayMap.filter(function(day) {
            return day[1].test(normalizedText);
        }).map(function(day) {
            return day[0];
        });

        return foundDays.length > 0 ? foundDays.join('·') : '-';
    }

    function formatCollectionDays(text) {
        if (Array.isArray(text)) {
            return text.filter(Boolean).join(' / ');
        }

        return String(text || '')
            .replace(/\+/g, ' / ')
            .replace(/·/g, ' / ')
            .replace(/\s*\/\s*/g, ' / ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function timeRange(start, end) {
        if (!start && !end) return '';
        if (start && end) return `${start} ~ ${end}`;
        return start || end;
    }

    function buildRulesFromApi(items) {
        if (items.length === 0) {
            return fallbackData;
        }

        const item = items[0];
        const householdDays = [
            {
                day: simplifyDayLabel(item.LF_WST_EMSN_DOW),
                item: '일반쓰레기'
            },
            {
                day: simplifyDayLabel(item.RCYCL_EMSN_DOW),
                item: '재활용'
            },
            {
                day: simplifyDayLabel(item.FOD_WST_EMSN_DOW),
                item: '음식물쓰레기'
            }
        ].filter(function(dayInfo) {
            return dayInfo.day !== '-';
        });

        if (householdDays.length > 0) {
            const times = [
                `일반쓰레기 ${timeRange(item.LF_WST_EMSN_BGNG_TM, item.LF_WST_EMSN_END_TM)}`,
                `재활용 ${timeRange(item.RCYCL_EMSN_BGNG_TM, item.RCYCL_EMSN_END_TM)}`,
                `음식물 ${timeRange(item.FOD_WST_EMSN_BGNG_TM, item.FOD_WST_EMSN_END_TM)}`
            ].filter(function(text) {
                return !text.endsWith(' ');
            });

            const methods = [
                item.EMSN_PLC || item.EMSN_PLC_TYPE,
                item.LF_WST_EMSN_MTHD,
                item.RCYCL_EMSN_MTHD,
                item.FOD_WST_EMSN_MTHD
            ].filter(Boolean);

            return {
                days: householdDays,
                time: compactText(times, fallbackData.time),
                location: compactText(methods, fallbackData.location)
            };
        }

        const usableItems = items.slice(0, 5);
        return {
            days: usableItems.map(function(item) {
                const itemName = pickField(item, [
                    'WSTE_KND_NM', 'WASTE_KND_NM', 'WSTE_SE_NM', 'TRASH_TYPE', 'ITEM_NM', 'DSCHRG_MTHD_NM'
                ]) || '배출정보';
                const dayText = pickField(item, [
                    'DSCHRG_DAY', 'DSCHRG_DAY_NM', 'COLCT_DAY', 'CLCT_DAY', 'TKAWAY_DAY', 'DOW'
                ]);
                return { day: simplifyDayLabel(dayText), item: itemName };
            }),
            time: compactText(usableItems.map(function(item) {
                return pickField(item, ['DSCHRG_TIME', 'DSCHRG_HR', 'CLCT_TIME', 'TKAWAY_TIME', 'DSCHRG_TM']);
            }), fallbackData.time),
            location: compactText(usableItems.map(function(item) {
                return pickField(item, ['DSCHRG_PLC', 'DSCHRG_PLC_TYPE', 'DSCHRG_PLACE', 'CLCT_PLC', 'TKAWAY_PLACE']);
            }), fallbackData.location)
        };
    }

    function renderRules(data) {
        collectionDays.innerHTML = data.days.map(function(dayInfo) {
            const formattedDays = formatCollectionDays(dayInfo.day);

            return `
                <div class="day-card">
                    <strong>${formattedDays}</strong>
                    <span>${dayInfo.item}</span>
                </div>
            `;
        }).join('');
        disposalTime.textContent = data.time;
        disposalLocation.textContent = data.location;
        
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function removeAdminCorrectionBoxes() {
        document.querySelectorAll('.admin-correction-box').forEach(function(box) {
            box.remove();
        });
    }

    function isApiBaseline(value) {
        return String(value || '').trim() === 'API 기준';
    }

    function hasAdminText(value) {
        return String(value || '').trim() !== '';
    }

    function isHideApiEnabled(value) {
        return value === true || String(value).toLowerCase() === 'true';
    }

    function isVisibleAdminRule(rule) {
        const status = String(rule?.status || '').trim();

        if (!status) return true;

        return !['숨김', '비공개', '삭제', '삭제됨', '중지'].includes(status);
    }

    function normalizeRegionText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function normalizeRegionForMatch(value) {
        return normalizeRegionText(value).replace(/\s+/g, '').toLowerCase();
    }

    function isAdminRegionMatch(rule, regionName) {
        const selectedRegion = normalizeRegionText(regionName);
        const dbRegion = normalizeRegionText(rule?.region);
        const { sido, sigungu } = splitRegionName(selectedRegion);
        const compactSelectedRegion = normalizeRegionForMatch(selectedRegion);
        const compactDbRegion = normalizeRegionForMatch(dbRegion);
        const compactSido = normalizeRegionForMatch(sido);
        const compactSigungu = normalizeRegionForMatch(sigungu);

        if (!selectedRegion || !dbRegion) return false;

        return (
            dbRegion === selectedRegion ||
            dbRegion.includes(selectedRegion) ||
            selectedRegion.includes(dbRegion) ||
            compactDbRegion === compactSelectedRegion ||
            compactDbRegion.includes(compactSelectedRegion) ||
            compactSelectedRegion.includes(compactDbRegion) ||
            (compactSido && compactSigungu && compactDbRegion.includes(compactSido) && compactDbRegion.includes(compactSigungu))
        );
    }

    async function waitForSupabaseClient() {
        var MAX_RETRY = 10;
        var INTERVAL  = 500;
        for (var i = 0; i < MAX_RETRY; i++) {
            if (window.supabaseClient) {
                console.log('[Supabase] 클라이언트 준비 완료 (' + (i * INTERVAL) + 'ms)');
                return window.supabaseClient;
            }
            console.log('[Supabase] 대기 중... (' + (i + 1) + '/' + MAX_RETRY + ')');
            await new Promise(function(resolve) { setTimeout(resolve, INTERVAL); });
        }
        console.error('[Supabase] 클라이언트를 찾지 못했습니다. window.supabaseClient가 초기화되었는지 확인하세요.');
        return null;
    }
    async function fetchAdminCorrection(regionName) {
        console.log('관리자 보정 조회 시작:', regionName);

        const supabaseClient = await waitForSupabaseClient();

        if (!supabaseClient) {
            console.warn('window.supabaseClient가 없어 local_rules 관리자 보정을 조회하지 못했습니다.');
            return null;
        }

        const { data, error } = await supabaseClient
            .from('local_rules')
            .select('id, region, schedule, place, note, status, source, hide_api')
            .order('id', { ascending: false });

        if (error) {
            console.warn('local_rules 관리자 보정 조회 실패:', error);
            return null;
        }

        console.log('local_rules 조회 결과:', data);

        const rows = (Array.isArray(data) ? data : []).filter(isVisibleAdminRule);
        const publishedRows = rows.filter(function(rule) {
            return String(rule.status || '').trim() === '게시중';
        });
        const blankStatusRows = rows.filter(function(rule) {
            return !hasAdminText(rule.status);
        });
        const noteRows = rows.filter(function(rule) {
            return hasAdminText(rule.note);
        });

        const matchedRule =
            publishedRows.find(function(rule) {
                return isAdminRegionMatch(rule, regionName);
            }) ||
            blankStatusRows.find(function(rule) {
                return isAdminRegionMatch(rule, regionName);
            }) ||
            noteRows.find(function(rule) {
                return isAdminRegionMatch(rule, regionName);
            }) ||
            rows.find(function(rule) {
                return isAdminRegionMatch(rule, regionName);
            }) ||
            null;

        console.log('관리자 보정 매칭 결과:', matchedRule);
        return matchedRule;
    }

    function renderAdminCorrection(adminRule) {
        if (!adminRule) return;

        console.log('renderAdminCorrection 실행:', adminRule);

        const hasCorrectionSchedule = hasAdminText(adminRule.schedule) && !isApiBaseline(adminRule.schedule);
        const hasCorrectionPlace = hasAdminText(adminRule.place) && !isApiBaseline(adminRule.place);
        const hasNote = hasAdminText(adminRule.note);

        if (!hasCorrectionSchedule && !hasCorrectionPlace && !hasNote) {
            return;
        }

        removeAdminCorrectionBoxes();

        const correctionHtml = `
            <div class="admin-correction-box" style="
                margin-top: 18px;
                padding: 18px;
                border-radius: 16px;
                background: #eef8ef;
                color: #2f6f3e;
                line-height: 1.7;
                font-weight: 700;
                border: 1px solid #cde8d0;
            ">
                <div style="font-size: 20px; margin-bottom: 8px; font-weight: 900;">관리자 추가 안내</div>
                ${hasCorrectionSchedule ? `<div><strong>보정 수거 요일:</strong> ${escapeHtml(adminRule.schedule)}</div>` : ''}
                ${hasCorrectionPlace ? `<div><strong>보정 배출 장소:</strong> ${escapeHtml(adminRule.place)}</div>` : ''}
                ${hasNote ? `<div>${escapeHtml(adminRule.note)}</div>` : ''}
            </div>
        `;

        apiStatus.insertAdjacentHTML('afterend', correctionHtml);
    }

    function renderAdminOnlyRule(adminRule) {
        if (!adminRule) return;

        removeAdminCorrectionBoxes();

        const hasCorrectionSchedule = hasAdminText(adminRule.schedule) && !isApiBaseline(adminRule.schedule);
        const hasCorrectionPlace = hasAdminText(adminRule.place) && !isApiBaseline(adminRule.place);

        collectionDays.innerHTML = `
            <div class="day-card local-loading-card">
                <strong>${hasCorrectionSchedule ? formatCollectionDays(adminRule.schedule) : '관리자 안내'}</strong>
                <span>${hasCorrectionSchedule ? '보정 수거 요일' : 'API 결과 대체'}</span>
            </div>
        `;

        disposalTime.textContent = hasCorrectionSchedule
            ? adminRule.schedule
            : '관리자 안내를 확인해주세요.';

        disposalLocation.textContent = hasCorrectionPlace
            ? adminRule.place
            : '관리자 안내를 확인해주세요.';

        apiStatus.textContent = isHideApiEnabled(adminRule.hide_api)
            ? '관리자 설정에 따라 공공데이터 API 결과를 숨기고 관리자 안내를 표시합니다.'
            : '공공데이터 API를 불러오지 못해 관리자 안내를 표시합니다.';

        renderAdminCorrection(adminRule);
    }

    function renderLoading() {
        collectionDays.innerHTML = `
            <div class="day-card local-loading-card">
                <strong>...</strong>
                <span>불러오는 중</span>
            </div>
        `;
        disposalTime.textContent = '공공데이터 API 조회 중';
        disposalLocation.textContent = '공공데이터 API 조회 중';
    }

    async function parseResponse(response) {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (error) {
            return { raw: text };
        }
    }

    function splitRegionName(regionName) {
        const parts = String(regionName || '').trim().split(/\s+/);
        const sido = parts[0] || '';
        const sigungu = parts.slice(1).join(' ');

        return { sido, sigungu };
    }

    function makeRequestUrl(regionName, keyName, options) {
        const requestOptions = options || {};
        const params = new URLSearchParams({
            pageNo: '1',
            numOfRows: '50',
            returnType: 'json',
            type: 'json',
            _type: 'json'
        });
        params.set(keyName, SERVICE_KEY);

        if (requestOptions.sido && requestOptions.sigungu) {
            params.append('cond[CTPV_NM::LIKE]', requestOptions.sido);
            params.append('cond[SGG_NM::LIKE]', requestOptions.sigungu);
        } else {
            params.append('cond[SGG_NM::LIKE]', regionName);
        }

        const url = `${API_ORIGIN}?${params.toString()}`;
        console.log('지역별 규칙 API 요청 URL:', url);
        return url;
    }

    async function fetchRegionRules(regionName) {
        const { sido, sigungu } = splitRegionName(regionName);
        const requestUrls = [
            makeRequestUrl(regionName, 'serviceKey'),
            makeRequestUrl(regionName, 'ServiceKey')
        ];

        if (sido && sigungu) {
            requestUrls.push(
                makeRequestUrl(regionName, 'serviceKey', { sido, sigungu }),
                makeRequestUrl(regionName, 'ServiceKey', { sido, sigungu })
            );
        }
        let lastError = null;
        let emptyPayload = null;

        for (const url of requestUrls) {
            try {
                const response = await fetch(url);
                const payload = await parseResponse(response);
                console.log('지역별 규칙 API 원본 응답:', payload);

                if (response.ok) {
                    const items = extractLocalRuleItems(payload);
                    if (items.length > 0) {
                        return payload;
                    }

                    emptyPayload = emptyPayload || payload;
                    continue;
                }
                lastError = new Error(`API 응답 오류: ${response.status}`);
            } catch (error) {
                lastError = error;
            }
        }

        if (emptyPayload) {
            return emptyPayload;
        }

        throw lastError || new Error('API 호출 실패');
    }

    async function loadRegionRules(regionName) {
        if (!regionName) {
            apiStatus.textContent = '시/도와 시/군/구를 선택하면 정보를 조회합니다.';
            return;
        }

        removeAdminCorrectionBoxes();

        console.log('API 요청 지역명:', regionName);
        renderLoading();
        apiStatus.textContent = '공공데이터 API에서 정보를 불러오는 중입니다.';

        let adminRule = null;

        try {
            adminRule = await fetchAdminCorrection(regionName);
        } catch (error) {
            console.warn('관리자 보정 데이터 확인 중 오류:', error);
            adminRule = null;
        }

        try {
            const payload = await fetchRegionRules(regionName);
            const items = normalizeItems(payload);
            const totalCount = getLocalRuleTotalCount(payload);

            if (adminRule && isHideApiEnabled(adminRule.hide_api)) {
                renderAdminOnlyRule(adminRule);
                return;
            }

            if (items.length > 0) {
                const data = buildRulesFromApi(items);
                renderRules(data);
                apiStatus.textContent = `공공데이터 API 조회 완료 (${items.length}건)`;

                if (adminRule) {
                    renderAdminCorrection(adminRule);
                }

                return;
            }

            if (totalCount === 0) {
                renderRules(fallbackData);
                apiStatus.textContent = 'API 결과가 없어 기본 예시 데이터를 표시합니다.';

                if (adminRule) {
                    renderAdminCorrection(adminRule);
                }

                return;
            }

            collectionDays.innerHTML = `
                <div class="day-card local-loading-card">
                    <strong>-</strong>
                    <span>조회 결과 없음</span>
                </div>
            `;
            disposalTime.textContent = 'API 응답에서 수거 요일 정보를 찾지 못했습니다.';
            disposalLocation.textContent = 'API 응답에서 배출 장소 정보를 찾지 못했습니다.';
            apiStatus.textContent = 'API 응답은 받았지만 결과 항목을 찾지 못했습니다. 콘솔의 원본 응답을 확인해주세요.';

            if (adminRule) {
                renderAdminCorrection(adminRule);
            }
        } catch (error) {
            console.error(error);

            if (adminRule) {
                renderAdminOnlyRule(adminRule);
                return;
            }

            renderRules(fallbackData);
            apiStatus.textContent = 'API 호출 실패: 인증키 사용 신청/승인 상태를 확인해주세요. 현재는 기본 예시 데이터를 표시합니다.';
        }
    }

    function handleSidoChange() {
        populateSigunguOptions(sidoSelect.value);
        apiStatus.textContent = sidoSelect.value
            ? '시/군/구를 선택하면 정보를 조회합니다.'
            : '시/도와 시/군/구를 선택하면 정보를 조회합니다.';
    }

    function handleSigunguChange() {
        const sido = sidoSelect.value;
        const sigungu = sigunguSelect.value;

        if (!sido || !sigungu) {
            apiStatus.textContent = '시/도와 시/군/구를 선택하면 정보를 조회합니다.';
            return;
        }

        const selectedRegion = `${sido} ${sigungu}`;
        console.log('선택된 시도:', sido);
        console.log('선택된 시군구:', sigungu);
        console.log('API 요청 지역명:', selectedRegion);

        loadRegionRules(selectedRegion);
    }

    populateSidoOptions();
    populateSigunguOptions('');
    renderRules(fallbackData);
    apiStatus.textContent = '시/도와 시/군/구를 선택하면 정보를 조회합니다.';
    sidoSelect.addEventListener('change', handleSidoChange);
    sigunguSelect.addEventListener('change', handleSigunguChange);
});
