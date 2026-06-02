document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = await window.AuthStorage.requireLoginAsync('로그인이 필요합니다.');
    if (!currentUser) {
        return;
    }

    const supabaseClient = window.supabaseClient;
    const resultTitle = document.getElementById('resultTitle');
    const imagePreview = document.getElementById('imagePreview');
    const guideButton = document.getElementById('guideButton');
    const anotherButton = document.getElementById('anotherButton');
    const resultLabel = document.querySelector('.result-label');
    const resultName = document.querySelector('.result-info strong');
    const recycleBadge = document.querySelector('.recycle-badge');
    const sortingText = document.querySelector('.sorting-copy p');

    resultTitle.textContent = `${currentUser.name}님의 분석 결과`;

    const history = window.AuthStorage.readUploadHistory(currentUser.email);
    const latestRecord = history[0];

    if (!latestRecord) {
        alert('최근 업로드 결과가 없습니다.');
        window.location.href = 'upload.html';
        return;
    }

    const analysis = latestRecord.analysisResult || {};
    const rawResult = analysis.rawPrediction || analysis;
    const modelClass = getModelClassFromResult(rawResult, analysis);
    const dbItem = await fetchAiItem(modelClass);
    const displayData = makeDisplayData(analysis, rawResult, dbItem);
    const detailType = getGuideTypeFromModelClass(modelClass);
    localStorage.setItem('wasteType', detailType);
    localStorage.setItem('className', modelClass || 'unknown');

    resultLabel.textContent = 'AI 분석 결과';
    resultName.textContent = getResultNameText(displayData);
    recycleBadge.innerHTML = `<span class="recycle-text">${displayData.status}</span>`;
    recycleBadge.classList.toggle('is-unavailable', displayData.status.includes('불가능'));
    sortingText.textContent = displayData.resultGuide;

    const img = document.createElement('img');
    img.src = latestRecord.image;
    img.alt = '분석한 쓰레기 사진';
    imagePreview.innerHTML = '';
    imagePreview.appendChild(img);

    guideButton.addEventListener('click', function() {
        window.location.href = `guide-detail.html?type=${encodeURIComponent(detailType)}`;
    });

    anotherButton.addEventListener('click', function() {
        window.location.href = 'upload.html';
    });

    function getModelClassFromResult(result, fallbackAnalysis) {
        const value = result.class
            || result.predicted_class
            || result.model_class
            || fallbackAnalysis.class
            || fallbackAnalysis.predicted_class
            || fallbackAnalysis.model_class
            || fallbackAnalysis.className
            || 'unknown';

        return String(value || 'unknown').trim().toLowerCase();
    }

    function getGuideTypeFromModelClass(modelClassValue) {
        const guideTypeMap = {
            biological: 'food_waste',
            cardboard: 'paper',
            clothes: 'general_waste',
            glass: 'glass_bottle',
            metal: 'can',
            paper: 'paper',
            plastic: 'plastic',
            shoes: 'general_waste',
            trash: 'general_waste',
            unknown: 'unknown'
        };

        return guideTypeMap[String(modelClassValue || 'unknown').toLowerCase()] || 'unknown';
    }

    async function fetchAiItem(modelClassValue) {
        if (!supabaseClient || !modelClassValue || modelClassValue === 'unknown') {
            return null;
        }

        try {
            const { data, error } = await supabaseClient
                .from('recycling_items')
                .select('model_class, name, category, status, result_guide')
                .eq('model_class', modelClassValue)
                .limit(1);

            if (error) {
                console.warn('AI 대표 품목 조회 실패:', error);
                return null;
            }

            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.warn('AI 대표 품목 조회 중 오류:', error);
            return null;
        }
    }

    function makeDisplayData(fallbackAnalysis, result, item) {
        const fallbackStatus = getFallbackStatus(fallbackAnalysis);

        return {
            name: item && item.name
                ? item.name
                : result.name_ko || fallbackAnalysis.itemName || fallbackAnalysis.category || result.class || '확인되지 않음',
            category: item && item.category
                ? item.category
                : fallbackAnalysis.category || result.category || '-',
            status: item && item.status
                ? item.status
                : fallbackStatus,
            resultGuide: item && item.result_guide
                ? item.result_guide
                : result.guide || fallbackAnalysis.disposalMethod || '분리배출 정보를 찾을 수 없습니다.'
        };
    }

    function getResultNameText(displayDataValue) {
        if (
            displayDataValue.category
            && displayDataValue.category !== '-'
            && displayDataValue.category !== displayDataValue.name
        ) {
            return `${displayDataValue.name} (${displayDataValue.category})`;
        }

        return displayDataValue.name;
    }

    function getFallbackStatus(fallbackAnalysis) {
        if (fallbackAnalysis.recyclable === false) {
            return '재활용 불가능';
        }

        if (fallbackAnalysis.recyclableText) {
            return fallbackAnalysis.recyclableText;
        }

        return '확인 필요';
    }

});
