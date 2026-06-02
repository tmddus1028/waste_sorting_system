document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const authMessage = document.getElementById('authMessage');
    const rememberIdCheckbox = document.getElementById('rememberId');
    const passwordToggle = document.querySelector('.login-password-toggle');
    const supabaseClient = window.supabaseClient;
    const REMEMBERED_EMAIL_KEY = 'rememberedLoginEmail';

    function showMessage(message, isError) {
        if (!authMessage) {
            alert(message);
            return;
        }

        authMessage.textContent = message;
        authMessage.classList.add('is-visible');
        authMessage.classList.toggle('is-error', Boolean(isError));
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        if (rememberIdCheckbox) {
            rememberIdCheckbox.checked = true;
        }
    }

    function getPasswordIcon(isVisible) {
        if (isVisible) {
            return `
                <svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
        }

        return `
            <svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M4 20 20 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
            </svg>
        `;
    }

    function updatePasswordToggle(button, input) {
        const isVisible = input.type === 'text';
        button.classList.toggle('is-visible', isVisible);
        button.setAttribute('aria-label', isVisible ? '비밀번호 숨기기' : '비밀번호 보기');
        button.innerHTML = getPasswordIcon(isVisible);
    }

    if (passwordToggle) {
        updatePasswordToggle(passwordToggle, passwordInput);

        passwordToggle.addEventListener('click', function() {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            updatePasswordToggle(passwordToggle, passwordInput);
        });
    }

    loginButton.addEventListener('click', async function() {
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage('이메일과 비밀번호를 입력해주세요.', true);
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('올바른 이메일 형식으로 입력해주세요.', true);
            return;
        }

        if (!supabaseClient) {
            showMessage('Supabase 연결 설정을 불러오지 못했습니다.', true);
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = '로그인 중...';
        showMessage('로그인 중입니다...', false);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error || !data.user) {
                showMessage(error?.message || '이메일 또는 비밀번호가 일치하지 않습니다.', true);
                return;
            }

            if (rememberIdCheckbox?.checked) {
                localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
            } else {
                localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }
            const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('name, role')
            .eq('id', data.user.id)
            .single();
            if (profileError || !profile) {
                console.error(profileError);
                showMessage('사용자 권한 정보를 불러오지 못했습니다.', true);
                return;
            }
            
            await window.AuthStorage.syncCurrentUserFromSupabase();
            if (profile.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error(error);
            showMessage('로그인 처리 중 오류가 발생했습니다.', true);
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = '로그인';
        }
    });
});
