document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = await window.AuthStorage.requireAdminAsync();
    if (!currentUser) {
        return;
    }

    const supabaseClient = window.supabaseClient;

    const adminWelcome = document.getElementById('adminWelcome');
    const adminMenu = document.querySelector('.admin-menu');
    const pageTitle = document.getElementById('adminPageTitle');
    const addButton = document.getElementById('addButton');
    const adminView = document.getElementById('adminView');

    let activeView = 'items';
    let currentData = {
        items: [],
        guide: [],
        rules: []
        };

    const menuConfig = {
        dashboard: { title: '대시보드', button: '' },
        items: { title: 'AI 대표 품목 관리', button: '새 AI 대표 품목 추가' },
        guide: { title: '재활용 가이드 관리', button: '새 가이드 추가' },
        rules: { title: '지역별 API 보정 관리', button: '새 보정 안내 추가' }
        };

    const tableMap = {
        items: 'recycling_items',
        guide: 'recycling_guides',
        rules: 'local_rules'
        };

    adminWelcome.textContent = currentUser.name + '님 환영합니다';

    function showError(error) {
        console.error(error);
        alert('데이터 처리 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }

    async function fetchTable(viewName) {
        const tableName = tableMap[viewName];
        let query = supabaseClient
            .from(tableName)
            .select('*');

        if (viewName === 'items') {
            query = query
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('id', { ascending: true });
        } else {
            query = query.order('id', { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return data || [];
    }

    async function getData() {
        const [items, guide, rules] = await Promise.all([
            fetchTable('items'),
            fetchTable('guide'),
            fetchTable('rules')
                ]);

        currentData = {
            items,
            guide,
            rules,
        };

        return currentData;
    }

    function actionButtons(id) {
        return `
            <div class="admin-actions">
                <button class="admin-icon-button edit-button" type="button" data-id="${id}" aria-label="수정">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 16.9V20h3.1L17.8 9.3l-3.1-3.1L4 16.9Z"></path>
                        <path d="M16.1 4.8l1.3-1.3a1.6 1.6 0 0 1 2.2 0l.9.9a1.6 1.6 0 0 1 0 2.2l-1.3 1.3-3.1-3.1Z"></path>
                    </svg>
                </button>
                <button class="admin-icon-button delete-button" type="button" data-id="${id}" aria-label="삭제">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 8h8l-.6 11.2A1.9 1.9 0 0 1 13.5 21h-3a1.9 1.9 0 0 1-1.9-1.8L8 8Z"></path>
                        <path d="M6 6h12"></path>
                        <path d="M10 6V4h4v2"></path>
                    </svg>
                </button>
            </div>
        `;
    }

    function statusClass(status) {
        return String(status || '').includes('불가능') ? 'is-unavailable' : 'is-available';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatAdminValue(value) {
        if (Array.isArray(value)) {
            value = value.filter(Boolean).join(' / ');
        }

        if (value === null || value === undefined || String(value).trim() === '') {
            return '-';
        }

        return escapeHtml(value);
    }

    function renderDashboard(data) {
        const recyclableCount = data.items.filter(function(item) {
            return !String(item.status || '').includes('불가능');
        }).length;

        adminView.innerHTML = `
            <div class="admin-dashboard-grid">
                <div class="admin-stat-card"><span>품목</span><strong>${data.items.length}</strong></div>
                <div class="admin-stat-card"><span>가이드</span><strong>${data.guide.length}</strong></div>
                <div class="admin-stat-card"><span>지역 규칙</span><strong>${data.rules.length}</strong></div>            </div>
            <div class="admin-table-card">
                <table class="admin-table">
                    <tbody>
                        <tr><th>재활용 가능 품목</th><td>${recyclableCount}개</td></tr>
                        <tr><th>재활용 불가능 품목</th><td>${data.items.length - recyclableCount}개</td></tr>                    </tbody>
                </table>
            </div>
        `;
    }

    function renderItems(data) {
        if (!data.items || data.items.length === 0) {
            adminView.innerHTML = `
                <div class="admin-empty-state">
                    등록된 AI 대표 품목이 없습니다.
                </div>
            `;
            return;
        }

        adminView.innerHTML = `
            <div class="admin-item-list">
                ${data.items.map(function(item) {
                    return `
                        <article class="admin-item-card">
                            <div class="admin-item-header">
                                <div class="admin-item-title-group">
                                    <div class="admin-item-title-row">
                                        <h3>${formatAdminValue(item.name)}</h3>
                                        <span class="admin-status ${statusClass(item.status)}">${formatAdminValue(item.status)}</span>
                                    </div>
                                    <div class="admin-item-meta">
                                        <span>AI 클래스명: ${formatAdminValue(item.model_class)}</span>
                                        <span>분류: ${formatAdminValue(item.category)}</span>
                                        <span>순서: ${formatAdminValue(item.display_order)}</span>
                                    </div>
                                </div>
                                <div class="admin-item-actions">
                                    ${actionButtons(item.id)}
                                </div>
                            </div>
                            <div class="admin-item-guide">
                                <span>결과 안내</span>
                                <p>${formatAdminValue(item.result_guide)}</p>
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
        `;
    }

   function renderGuide(data) {
    if (!data.guide || data.guide.length === 0) {
        adminView.innerHTML = `
            <div class="admin-empty-state">
                등록된 재활용 가이드가 없습니다.
            </div>
        `;
        return;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatValue(value) {
        if (Array.isArray(value)) {
            value = value.filter(Boolean).join(' / ');
        }

        if (value === null || value === undefined || String(value).trim() === '') {
            return '-';
        }

        return escapeHtml(value);
    }

    function detailItem(label, value) {
        return `
            <div class="admin-guide-detail-item">
                <span>${label}</span>
                <p>${formatValue(value)}</p>
            </div>
        `;
    }

    adminView.innerHTML = `
        <div class="admin-guide-list">
            ${data.guide.map(function(item) {
                const disposeText = item.dispose || item.content;

                return `
                    <article class="admin-guide-card">
                        <div class="admin-guide-header">
                            <div class="admin-guide-title-group">
                                <h3>${formatValue(item.title)}</h3>
                                <div class="admin-guide-meta">
                                    <span>품목 코드: ${formatValue(item.type)}</span>
                                    <span>분류: ${formatValue(item.category)}</span>
                                </div>
                            </div>
                            <div class="admin-guide-actions">
                                ${actionButtons(item.id)}
                            </div>
                        </div>
                        <p class="admin-guide-summary">${formatValue(item.summary)}</p>
                        <div class="admin-guide-detail-grid">
                            ${detailItem('세척 방법', item.wash)}
                            ${detailItem('분리 방법', item.separate)}
                            ${detailItem('배출 방법', disposeText)}
                            ${detailItem('주의사항', item.caution)}
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
        `;
    }

    function renderRules(data) {
        if (!data.rules || data.rules.length === 0) {
            adminView.innerHTML = `
                <div class="admin-empty-state">
                    등록된 지역별 API 보정 데이터가 없습니다.
                </div>
            `;
            return;
        }

        adminView.innerHTML = `
            <div class="admin-rule-list">
                ${data.rules.map(function(item) {
                    const apiLabel = item.hide_api ? 'API 숨김' : 'API 표시';
                    const apiClass = item.hide_api ? 'is-hidden' : 'is-visible';

                    return `
                        <article class="admin-rule-card">
                            <div class="admin-rule-header">
                                <div class="admin-rule-title">
                                    <h3>${formatAdminValue(item.region)}</h3>
                                    <div class="admin-rule-badges">
                                        <span class="admin-rule-badge ${apiClass}">${apiLabel}</span>
                                    </div>
                                </div>
                                <div class="admin-rule-actions">
                                    ${actionButtons(item.id)}
                                </div>
                            </div>
                            <div class="admin-rule-grid">
                                <div class="admin-rule-field">
                                    <span>보정 수거 요일</span>
                                    <p>${formatAdminValue(item.schedule || 'API 기준')}</p>
                                </div>
                                <div class="admin-rule-field">
                                    <span>보정 배출 장소</span>
                                    <p>${formatAdminValue(item.place || 'API 기준')}</p>
                                </div>
                            </div>
                            <div class="admin-rule-note">
                                <span>관리자 추가 안내</span>
                                <p>${formatAdminValue(item.note || '-')}</p>
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
        `;
    }
    async function render() {
        try {
            const data = await getData();
            const config = menuConfig[activeView];

            pageTitle.textContent = config.title;
            addButton.style.display = config.button ? 'inline-flex' : 'none';
            addButton.lastChild.textContent = config.button ? ' ' + config.button : '';

            if (activeView === 'dashboard') renderDashboard(data);
            if (activeView === 'items') renderItems(data);
            if (activeView === 'guide') renderGuide(data);
            if (activeView === 'rules') renderRules(data);
                } catch (error) {
            showError(error);
        }
    }

    function promptValue(label, value) {
        const nextValue = prompt(label, value || '');
        return nextValue === null ? null : nextValue.trim();
    }
    function normalizeEmptyValue(value) {
        const text = String(value || '').trim();
        if (!text || text === '-') {
            return null;
        }
        return text;
    }


    function normalizeCautionInput(value) {
        const text = String(value || '').trim();
        if (!text || text === '-') {
            return [];
        }
        return text
        .split('\n')
        .map(function(item) {
            return item.trim();
        })
        .filter(Boolean);
    }

    async function addRecord() {
        try {
            const tableName = tableMap[activeView];
            let payload = null;

            if (activeView === 'items') {
                const modelClass = promptValue('AI 클래스명을 입력하세요. 예: plastic, paper, trash', 'plastic');
                if (modelClass === null) return;
                const name = promptValue('품목명을 입력하세요.', '플라스틱');
                if (name === null) return;
                const category = promptValue('분류를 입력하세요.', '플라스틱류');
                if (category === null) return;
                const status = promptValue('재활용 여부를 입력하세요.', '재활용 가능');
                if (status === null) return;
                const resultGuide = promptValue('AI 결과 화면에 표시할 분리배출 안내를 입력하세요.', '내용물을 비우고 깨끗하게 헹군 뒤 분리배출하세요.');
                if (resultGuide === null) return;
                const displayOrderInput = promptValue('표시 순서를 입력하세요.', String(currentData.items.length + 1));
                if (displayOrderInput === null) return;
                const displayOrder = Number(displayOrderInput);

                payload = {
                    model_class: modelClass,
                    name,
                    category,
                    status,
                    result_guide: resultGuide,
                    display_order: Number.isFinite(displayOrder) ? displayOrder : null
                };
            }

            if (activeView === 'guide') {
                const type = promptValue('품목 코드를 입력하세요. 예: plastic, paper, can', 'plastic');
                if (type === null) return;
                const title = promptValue('가이드명을 입력하세요.', '플라스틱 상세 가이드');
                if (title === null) return;
                const summary = promptValue('목록에 표시될 요약을 입력하세요.', '페트병, 용기류, 플라스틱 포장재');
                if (summary === null) return;
                const category = promptValue('분류를 입력하세요.', '플라스틱');
                if (category === null) return;
                const wash = promptValue('세척 방법을 입력하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.', '');
                if (wash === null) return;
                const separate = promptValue('분리 방법을 입력하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.', '');
                if (separate === null) return;
                const dispose = promptValue('배출 방법을 입력하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.', '');
                if (dispose === null) return;
                const cautionInput = promptValue(
                    '주의사항을 입력하세요. 여러 개는 줄바꿈으로 구분하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.',
                    ''
                );
                if (cautionInput === null) return;
                const normalizedDispose = normalizeEmptyValue(dispose);
                payload = {
                    type: normalizeEmptyValue(type),
                    title: normalizeEmptyValue(title),
                    summary: normalizeEmptyValue(summary),
                    category: normalizeEmptyValue(category),
                    content: normalizedDispose,
                    wash: normalizeEmptyValue(wash),
                    separate: normalizeEmptyValue(separate),
                    dispose: normalizedDispose,
                    caution: normalizeCautionInput(cautionInput)
                };
            }
            if (activeView === 'rules') {
                const region = promptValue('지역명을 입력하세요.', '서울특별시 강남구');
                if (!region) return;
                const schedule = promptValue('API 결과가 틀렸을 때 보정할 수거 요일을 입력하세요. API 기준이면 비워두세요.', '');
                const place = promptValue('API 결과가 틀렸을 때 보정할 배출 장소를 입력하세요. API 기준이면 비워두세요.', '');
                const note = promptValue('API 결과 아래에 추가로 보여줄 관리자 안내를 입력하세요.', '공동주택은 단지 내 분리수거장을 이용해주세요.');
                if (!note) return;
                const hideApi = confirm('이 지역의 API 결과를 숨기고 관리자 안내만 보여줄까요?');
                payload = {
                    region,
                    schedule: schedule || 'API 기준',
                    place: place || 'API 기준',
                    note,
                    status: '게시중',
                    source: 'admin',
                    hide_api: hideApi
                };
            }
            if (!payload || !tableName) {
                return;
            }

            
            const { error } = await supabaseClient
            .from(tableName)
            .insert(payload);
            if (error) {
                throw error;
            }
            await render();
        } catch (error) {
            showError(error);
        }
    }

    async function editRecord(id) {
        try {
            const tableName = tableMap[activeView];
            const list = currentData[activeView];
            const item = list.find(function(row) {
                return Number(row.id) === Number(id);
            });

            if (!item) {
                alert('수정할 데이터를 찾지 못했습니다.');
                return;
            }

            let payload = null;

            if (activeView === 'items') {
                const modelClass = promptValue('AI 클래스명을 수정하세요.', item.model_class || '');
                if (modelClass === null) return;
                const name = promptValue('품목명을 수정하세요.', item.name || '');
                if (name === null) return;
                const category = promptValue('분류를 수정하세요.', item.category || '');
                if (category === null) return;
                const status = promptValue('재활용 여부를 수정하세요.', item.status || '');
                if (status === null) return;
                const resultGuide = promptValue('AI 결과 화면에 표시할 분리배출 안내를 수정하세요.', item.result_guide || '');
                if (resultGuide === null) return;
                const displayOrderInput = promptValue('표시 순서를 수정하세요.', String(item.display_order ?? ''));
                if (displayOrderInput === null) return;
                const displayOrder = Number(displayOrderInput);

                payload = {
                    model_class: modelClass,
                    name,
                    category,
                    status,
                    result_guide: resultGuide,
                    display_order: Number.isFinite(displayOrder) ? displayOrder : null
                };
            }
            if (activeView === 'guide') {
                const title = promptValue('가이드명을 수정하세요.', item.title || '');
                if (title === null) return;
                const summary = promptValue('목록 요약을 수정하세요.', item.summary || '');
                if (summary === null) return;
                const category = promptValue('분류를 수정하세요.', item.category || '');
                if (category === null) return;
                const wash = promptValue(
                    '세척 방법을 수정하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.',
                    item.wash || ''
                );
                if (wash === null) return;
                const separate = promptValue(
                    '분리 방법을 수정하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.',
                    item.separate || ''
                );
                if (separate === null) return;
                const dispose = promptValue(
                    '배출 방법을 수정하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.',
                    item.dispose || item.content || ''
                );
                if (dispose === null) return;
                const currentCaution = Array.isArray(item.caution)
                ? item.caution.join('\n')
                : item.caution || '';
                const cautionInput = promptValue(
                    '주의사항을 수정하세요. 여러 개는 줄바꿈으로 구분하세요. 기본값을 쓰려면 비워두거나 -를 입력하세요.',
                    currentCaution
                );
                if (cautionInput === null) return;
                const normalizedDispose = normalizeEmptyValue(dispose);
                payload = {
                    type: item.type,
                    title: normalizeEmptyValue(title) || item.title,
                    summary: normalizeEmptyValue(summary) || item.summary,
                    category: normalizeEmptyValue(category) || item.category,
                    content: normalizedDispose,
                    wash: normalizeEmptyValue(wash),
                    separate: normalizeEmptyValue(separate),
                    dispose: normalizedDispose,
                    caution: normalizeCautionInput(cautionInput)
                };
            }            
            if (activeView === 'rules') {
                const region = promptValue('지역명을 수정하세요.', item.region);
                if (!region) return;
                const schedule = promptValue('보정 수거 요일을 수정하세요. API 기준이면 "API 기준"이라고 입력하세요.', item.schedule || 'API 기준');
                if (!schedule) return;
                const place = promptValue('보정 배출 장소를 수정하세요. API 기준이면 "API 기준"이라고 입력하세요.', item.place || 'API 기준');
                if (!place) return;
                const note = promptValue('관리자 추가 안내를 수정하세요.', item.note || '');
                if (!note) return;
                const hideApi = confirm('이 지역의 API 결과를 숨기고 관리자 안내만 보여줄까요?\n확인 = 숨김, 취소 = API 표시');
                payload = {
                    region,
                    schedule,
                    place,
                    note,
                    status: item.status || '게시중',
                    source: item.source || 'admin',
                    hide_api: hideApi
                };
            }
            
            if (!payload || !tableName) {
                return;
            }

            const { error } = await supabaseClient
                .from(tableName)
                .update(payload)
                .eq('id', id);

            if (error) {
                throw error;
            }

            await render();
        } catch (error) {
            showError(error);
        }
    }

    async function deleteRecord(id) {
        try {
            const tableName = tableMap[activeView];

            if (!confirm('삭제하시겠습니까?')) {
                return;
            }

            const { error } = await supabaseClient
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            await render();
        } catch (error) {
            showError(error);
        }
    }

    adminMenu.addEventListener('click', async function(event) {
        const menuItem = event.target.closest('.admin-menu-item');
        if (!menuItem) return;
        event.preventDefault();

        const menuType = menuItem.dataset.adminMenu;

        if (menuType === 'logout') {
            window.AuthStorage.logout('login.html');
            return;
        }

        activeView = menuType;

        document.querySelectorAll('.admin-menu-item').forEach(function(item) {
            item.classList.remove('is-active');
        });

        menuItem.classList.add('is-active');

        await render();
    });

    adminView.addEventListener('click', async function(event) {
        const editButton = event.target.closest('.edit-button');
        const deleteButton = event.target.closest('.delete-button');

        if (editButton) {
            await editRecord(Number(editButton.dataset.id));
        }

        if (deleteButton) {
            await deleteRecord(Number(deleteButton.dataset.id));
        }
    });

    addButton.addEventListener('click', addRecord);

    await render();
});
