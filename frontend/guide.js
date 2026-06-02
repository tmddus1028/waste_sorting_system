document.addEventListener('DOMContentLoaded', async function() {
    const guideList = document.getElementById('guideList');
    const supabaseClient = window.supabaseClient;

    const defaultGuideItems = [
        { type: 'plastic', title: '플라스틱', summary: '페트병, 용기류, 플라스틱 포장재' },
        { type: 'paper', title: '종이', summary: '신문지, 책자, 골판지, 일반 종이류' },
        { type: 'paper_cup', title: '종이컵', summary: '일회용 컵, 코팅 종이컵' },
        { type: 'can', title: '캔', summary: '알루미늄캔, 철캔, 통조림캔' },
        { type: 'glass_bottle', title: '유리병', summary: '음료병, 주류병, 소스병' },
        { type: 'vinyl', title: '비닐', summary: '비닐봉투, 포장 비닐, 필름류' },
        { type: 'food_waste', title: '음식물 쓰레기', summary: '조리 후 남은 음식, 생재료 부산물' },
        { type: 'general_waste', title: '일반 쓰레기', summary: '재활용이 어려운 혼합/오염 폐기물' }
    ];

    function renderGuideList(items) {
        guideList.innerHTML = items.map(function(item) {
            return `
                <button class="guide-list-item" type="button" data-type="${item.type}">
                    <span>${item.title}</span>
                    <small>${item.summary || ''}</small>
                </button>
            `;
        }).join('');
    }

    async function loadGuideItems() {
        if (!supabaseClient) {
            console.warn('Supabase 클라이언트를 찾지 못해 기본 가이드 목록을 표시합니다.');
            renderGuideList(defaultGuideItems);
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('recycling_guides')
                .select('type, title, summary')
                .order('id', { ascending: true });

            if (error) {
                console.error('가이드 목록 조회 실패:', error);
                renderGuideList(defaultGuideItems);
                return;
            }

            const dbItems = (data || []).filter(function(item) {
                return item && item.type;
            });

            if (dbItems.length === 0) {
                renderGuideList(defaultGuideItems);
                return;
            }

            const dbItemMap = new Map();
            dbItems.forEach(function(item) {
                if (!dbItemMap.has(item.type)) {
                    dbItemMap.set(item.type, item);
                }
            });

            const defaultTypeSet = new Set(defaultGuideItems.map(function(item) {
                return item.type;
            }));

            const mergedDefaultItems = defaultGuideItems.map(function(defaultItem) {
                const dbItem = dbItemMap.get(defaultItem.type);

                return {
                    type: defaultItem.type,
                    title: dbItem?.title || defaultItem.title,
                    summary: dbItem?.summary || defaultItem.summary
                };
            });

            const extraItems = dbItems
                .filter(function(item) {
                    return !defaultTypeSet.has(item.type);
                })
                .filter(function(item, index, items) {
                    return items.findIndex(function(compareItem) {
                        return compareItem.type === item.type;
                    }) === index;
                })
                .map(function(item) {
                    return {
                        type: item.type,
                        title: item.title || item.type,
                        summary: item.summary || ''
                    };
                });

            renderGuideList([
                ...mergedDefaultItems,
                ...extraItems
            ]);
        } catch (error) {
            console.error('가이드 목록 조회 실패:', error);
            renderGuideList(defaultGuideItems);
        }
    }

    guideList.addEventListener('click', function(event) {
        const card = event.target.closest('.guide-list-item');

        if (!card) {
            return;
        }

        window.location.href = `guide-detail.html?type=${encodeURIComponent(card.dataset.type)}`;
    });

    await loadGuideItems();
});
