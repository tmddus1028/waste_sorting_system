(function() {
    const CURRENT_USER_KEY = 'currentUser';
    const supabaseClient = window.supabaseClient || null;

    function getCurrentUser() {
        try {
            const savedUser = localStorage.getItem(CURRENT_USER_KEY);
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            localStorage.removeItem(CURRENT_USER_KEY);
            return null;
        }
    }

    function getNameFromEmail(email) {
        return email ? String(email).split('@')[0] : '사용자';
    }

    function getDisplayName(user) {
        const email = user?.email || '';
        return user?.name || getNameFromEmail(email);
    }

    function setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(CURRENT_USER_KEY);
            return;
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            id: user.id || user.user_id || '',
            name: getDisplayName(user),
            email: user.email || '',
            role: user.role || 'user'
        }));
    }

    async function getProfile(user) {
        if (!supabaseClient || !user) {
            return null;
        }

        const { data, error } = await supabaseClient
            .from('profiles')
            .select('id, name, email, role')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.warn('Profile load failed:', error.message);
            return null;
        }

        return data;
    }

    async function syncCurrentUserFromSupabase() {
        if (!supabaseClient) {
            return getCurrentUser();
        }

        const { data } = await supabaseClient.auth.getSession();
        const sessionUser = data.session?.user;

        if (!sessionUser) {
            localStorage.removeItem(CURRENT_USER_KEY);
            return null;
        }

        const profile = await getProfile(sessionUser);
        const currentUser = {
            id: sessionUser.id,
            name: profile?.name || sessionUser.user_metadata?.name || getNameFromEmail(sessionUser.email),
            email: profile?.email || sessionUser.email,
            role: profile?.role || 'user'
        };
        setCurrentUser(currentUser);
        return currentUser;
    }

    async function logout(redirectTo) {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }

        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = redirectTo || 'index.html';
    }

    function requireLogin(message) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert(message || '로그인이 필요합니다.');
            window.location.href = 'login.html';
            return null;
        }
        return currentUser;
    }

    async function requireLoginAsync(message) {
        const syncedUser = await syncCurrentUserFromSupabase();
        if (syncedUser) {
            return syncedUser;
        }

        return requireLogin(message);
    }

    function requireAdmin() {
        const currentUser = requireLogin('로그인이 필요합니다.');
        if (!currentUser) {
            return null;
        }

        if (currentUser.role !== 'admin') {
            alert('관리자만 접근할 수 있습니다.');
            window.location.href = 'index.html';
            return null;
        }

        return currentUser;
    }

    async function requireAdminAsync() {
        const currentUser = await requireLoginAsync('로그인이 필요합니다.');
        if (!currentUser) {
            return null;
        }

        if (currentUser.role !== 'admin') {
            alert('관리자만 접근할 수 있습니다.');
            window.location.href = 'index.html';
            return null;
        }

        return currentUser;
    }

    function getUploadHistoryKey(email) {
        return `uploadHistory_${email}`;
    }

    function readUploadHistory(email) {
        try {
            return JSON.parse(localStorage.getItem(getUploadHistoryKey(email))) || [];
        } catch (error) {
            return [];
        }
    }

    function saveUploadHistory(email, history) {
        localStorage.setItem(getUploadHistoryKey(email), JSON.stringify(history));
    }

    function renderMainAuthState() {
        const navButtons = document.getElementById('navAuthArea');
        if (!navButtons) {
            return;
        }

        const currentUser = getCurrentUser();
        if (!currentUser) {
            navButtons.innerHTML = `
                <button class="btn-nav-outline" type="button" onclick="window.location.href='login.html'">로그인</button>
                <button class="btn-nav-filled" type="button" onclick="window.location.href='register.html'">회원가입</button>
            `;
            return;
        }

        navButtons.innerHTML = `
            <span class="nav-welcome">${currentUser.name}님 환영합니다</span>
            <button class="btn-nav-outline" id="logoutButton" type="button">로그아웃</button>
        `;

        document.getElementById('logoutButton').addEventListener('click', function() {
            logout('index.html');
        });
    }

    async function initAuthUI() {
        renderMainAuthState();
        await syncCurrentUserFromSupabase();
        renderMainAuthState();
    }

    window.AuthStorage = {
        getCurrentUser,
        setCurrentUser,
        syncCurrentUserFromSupabase,
        logout,
        requireLogin,
        requireLoginAsync,
        requireAdmin,
        requireAdminAsync,
        getUploadHistoryKey,
        readUploadHistory,
        saveUploadHistory
    };

    window.handleUploadCardClick = function() {
        if (!getCurrentUser()) {
            alert('로그인 후 이용할 수 있습니다.');
            window.location.href = 'login.html';
            return;
        }
        window.location.href = 'upload.html';
    };

    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(function() {
            syncCurrentUserFromSupabase().then(renderMainAuthState);
        });
    }

    document.addEventListener('DOMContentLoaded', initAuthUI);
})();
