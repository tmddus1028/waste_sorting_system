const guideData = {
    plastic: {
        title: '플라스틱 상세 가이드',
        category: '플라스틱',
        wash: '내용물을 완전히 비우고 물로 가볍게 헹궈 음식물, 액체, 이물질을 제거하세요.',
        separate: '라벨, 뚜껑, 펌프, 스티커처럼 다른 재질은 가능한 한 분리하세요.',
        dispose: '페트병은 투명 페트병 수거함에, 그 외 플라스틱은 지역 기준에 맞는 플라스틱류 수거함에 배출하세요.',
        caution: [
            '오염이 심하거나 여러 재질이 붙어 분리되지 않는 플라스틱은 재활용이 어려울 수 있습니다.',
            '일회용 수저, 빨대, 칫솔처럼 작은 플라스틱은 지역 기준에 따라 일반쓰레기로 처리될 수 있습니다.'
        ]
    },
    paper: {
        title: '종이 상세 가이드',
        category: '종이',
        wash: '물기와 음식물 오염을 제거하고 가능한 한 마른 상태로 모아주세요.',
        separate: '비닐 코팅, 스프링, 테이프, 철심 등 종이가 아닌 부분은 제거하세요.',
        dispose: '신문지, 책자, 전단지, 일반 종이는 종류별로 묶거나 종이류 수거함에 배출하세요.',
        caution: [
            '영수증, 기름 묻은 종이, 코팅지, 방수지는 재활용이 어려운 경우가 많습니다.',
            '개인정보가 있는 문서는 잘게 찢거나 파쇄한 뒤 배출하세요.'
        ]
    },
    paper_cup: {
        title: '종이컵 상세 가이드',
        category: '종이',
        wash: '남은 음료를 비우고 물로 헹군 뒤 충분히 말려주세요.',
        separate: '플라스틱 뚜껑, 빨대, 컵홀더는 각각 재질에 맞게 분리하세요.',
        dispose: '깨끗하고 마른 종이컵은 별도 수거함이 있으면 종이컵류로, 없으면 지역 지침에 따라 배출하세요.',
        caution: [
            '내부 코팅 때문에 일반 종이류와 함께 재활용되지 않는 지역이 있습니다.',
            '음료가 남아 있거나 오염된 종이컵은 일반쓰레기로 배출하는 것이 안전합니다.'
        ]
    },
    can: {
        title: '캔 상세 가이드',
        category: '금속',
        wash: '내용물을 비우고 물로 헹궈 냄새와 이물질을 줄여주세요.',
        separate: '플라스틱 뚜껑, 빨대, 라벨 등 다른 재질은 제거하세요.',
        dispose: '가능하면 캔을 눌러 부피를 줄인 뒤 캔류 또는 금속류 수거함에 배출하세요.',
        caution: [
            '부탄가스, 스프레이 캔은 반드시 다 쓴 뒤 구멍을 뚫지 말고 지역 지침에 따라 배출하세요.',
            '날카로운 금속 조각은 다치지 않도록 감싸서 배출하세요.'
        ]
    },
    glass_bottle: {
        title: '유리병 상세 가이드',
        category: '유리',
        wash: '병 안의 내용물을 비우고 물로 헹군 뒤 라벨과 뚜껑을 가능한 한 분리하세요.',
        separate: '병뚜껑, 코르크, 금속 캡 등 다른 재질은 따로 분리하세요.',
        dispose: '깨지지 않은 유리병은 유리병 수거함에 넣고, 보증금 병은 반환 가능한 곳에 반납하세요.',
        caution: [
            '깨진 유리는 신문지 등에 감싸 일반쓰레기 또는 지역 지정 방식으로 배출하세요.',
            '거울, 내열유리, 도자기, 전구는 유리병류가 아닙니다.'
        ]
    },
    vinyl: {
        title: '비닐 상세 가이드',
        category: '비닐',
        wash: '내용물을 털어내고 음식물이나 액체가 묻은 부분은 닦거나 말려주세요.',
        separate: '스티커, 종이라벨, 금속 클립처럼 비닐이 아닌 재질은 제거하세요.',
        dispose: '깨끗한 비닐봉투와 포장 비닐은 비닐류 수거함에 모아서 배출하세요.',
        caution: [
            '오염이 심한 비닐, 랩, 음식물이 묻은 비닐은 일반쓰레기로 배출하는 경우가 많습니다.',
            '작은 비닐은 흩날리지 않도록 한 봉투에 모아 배출하세요.'
        ]
    },
    food_waste: {
        title: '음식물 쓰레기 상세 가이드',
        category: '음식물',
        wash: '세척 대상은 아니지만 물기를 최대한 제거해 냄새와 무게를 줄이세요.',
        separate: '비닐, 이쑤시개, 뼈, 조개껍데기, 씨앗처럼 음식물이 아닌 것은 분리하세요.',
        dispose: '음식물 쓰레기 전용 봉투나 전용 수거함에 지역 배출 시간에 맞춰 배출하세요.',
        caution: [
            '동물이 먹기 어려운 뼈, 껍데기, 단단한 씨앗류는 일반쓰레기로 분류되는 경우가 많습니다.',
            '국물은 하수구에 버리지 말고 물기를 제거한 뒤 배출하세요.'
        ]
    },
    general_waste: {
        title: '일반 쓰레기 상세 가이드',
        category: '일반쓰레기',
        wash: '재활용 가능한 부분이 있다면 먼저 비우고 닦아 분리하세요.',
        separate: '종이, 플라스틱, 금속, 유리 등 분리 가능한 재질은 최대한 떼어내세요.',
        dispose: '재활용이 어려운 혼합 재질, 오염 폐기물은 종량제 봉투에 담아 배출하세요.',
        caution: [
            '배터리, 형광등, 의약품 등 유해 폐기물은 전용 수거함이나 지정 장소를 이용하세요.',
            '날카로운 물건은 다치지 않도록 감싼 뒤 배출하세요.'
        ]
    },
    unknown: {
        title: '확인 필요 상세 가이드',
        category: '확인 필요',
        wash: '품목이 명확하지 않다면 이물질을 제거하고 재질을 먼저 확인하세요.',
        separate: '표시된 재질 마크와 지역 분리배출 기준을 함께 확인하세요.',
        dispose: '분류가 어렵다면 재활용품에 섞지 말고 지역 안내를 확인한 뒤 배출하세요.',
        caution: [
            '오염된 재활용품은 다른 재활용품까지 오염시킬 수 있습니다.',
            '확신이 없을 때는 지역별 규칙 확인 화면에서 기준을 확인하세요.'
        ]
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    const guideTitle = document.getElementById('guideTitle');
    const guideContent = document.getElementById('guideContent');
    const supabaseClient = window.supabaseClient;

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'unknown';

    const fallbackGuide = guideData[type] || guideData.unknown;

    function normalizeCaution(cautionValue, fallbackCaution) {
        if (Array.isArray(cautionValue)) {
            return cautionValue.length > 0 ? cautionValue : fallbackCaution;
        }

        if (typeof cautionValue === 'string' && cautionValue.trim() !== '') {
            try {
                const parsed = JSON.parse(cautionValue);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) {
                return cautionValue
                    .split('\n')
                    .map(function(item) {
                        return item.trim();
                    })
                    .filter(Boolean);
            }
        }

        return fallbackCaution;
    }
    function useDbOrFallback(value, fallback) {
        const text = String(value || '').trim();

        if (!text || text === '-') {
            return fallback;
        }
        return text;
    }

    function renderGuide(guide) {
        guideTitle.textContent = guide.title;

        guideContent.innerHTML = `
            <section class="guide-section">
                <div class="guide-copy">
                    <h2>세척 방법</h2>
                    <p>${guide.wash}</p>
                </div>
            </section>

            <section class="guide-section">
                <div class="guide-copy">
                    <h2>분리 방법</h2>
                    <p>${guide.separate}</p>
                </div>
            </section>

            <section class="guide-section">
                <div class="guide-copy">
                    <h2>배출 방법</h2>
                    <p>${guide.dispose}</p>
                </div>
            </section>

            <section class="guide-section guide-warning">
                <h2>주의사항</h2>
                <ul>
                    ${guide.caution.map(function(item) {
                        return `<li>${item}</li>`;
                    }).join('')}
                </ul>
            </section>
        `;
    }

    async function loadGuideDetail() {
        if (!supabaseClient) {
            console.warn('Supabase 클라이언트를 찾지 못해 기본 상세 가이드를 표시합니다.');
            renderGuide(fallbackGuide);
            return;
        }

        const { data, error } = await supabaseClient
            .from('recycling_guides')
            .select('type, title, category, wash, separate, dispose, caution, content')
            .eq('type', type)
            .maybeSingle();

        if (error || !data) {
            console.error('상세 가이드 조회 실패 또는 데이터 없음:', error);
            renderGuide(fallbackGuide);
            return;
        }

        const guide = {
    
            title: useDbOrFallback(data.title, fallbackGuide.title),
            category: useDbOrFallback(data.category, fallbackGuide.category),
            wash: useDbOrFallback(data.wash, fallbackGuide.wash),
            separate: useDbOrFallback(data.separate, fallbackGuide.separate),
            dispose: useDbOrFallback(data.dispose || data.content, fallbackGuide.dispose),
            caution: normalizeCaution(data.caution, fallbackGuide.caution)
        };

        renderGuide(guide);
    }

    await loadGuideDetail();
});