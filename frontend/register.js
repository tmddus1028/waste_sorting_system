document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerButton = document.getElementById('registerButton');
    const authMessage = document.getElementById('authMessage');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const supabaseClient = window.supabaseClient;

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

    toggleButtons.forEach(function(button) {
        const input = button.previousElementSibling;
        updatePasswordToggle(button, input);

        button.addEventListener('click', function() {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            updatePasswordToggle(button, input);
        });
    });

    async function upsertProfile(user, name, email) {
        if (!user) {
            return;
        }

        const { error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: user.id,
                name,
                email,
                role: 'user'
            }, { onConflict: 'id' });

        if (error) {
            console.warn('Profile save skipped:', error.message);
        }
    }

    registerButton.addEventListener('click', async function() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!name || !email || !password || !confirmPassword) {
            showMessage('모든 항목을 입력해주세요.', true);
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('올바른 이메일 형식으로 입력해주세요.', true);
            return;
        }

        if (password.length < 6) {
            showMessage('비밀번호는 6자 이상 입력해주세요.', true);
            return;
        }

        if (password !== confirmPassword) {
            showMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.', true);
            return;
        }

        if (!supabaseClient) {
            showMessage('Supabase 연결 설정을 불러오지 못했습니다.', true);
            return;
        }

        registerButton.disabled = true;
        registerButton.textContent = '가입 중...';
        showMessage('회원가입을 처리하는 중입니다...', false);

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });

            if (error) {
                if (error.message && error.message.toLowerCase().includes('already')) {
                    showMessage('이미 가입된 이메일입니다.', true);
                } else {
                    showMessage(error.message || '회원가입 중 오류가 발생했습니다.', true);
                }
                return;
            }

            if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
                showMessage('이미 가입된 이메일입니다.', true);
                return;
            }

            if (data.session && data.user) {
                await upsertProfile(data.user, name, email);
                await supabaseClient.auth.signOut();
                localStorage.removeItem('currentUser');
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                window.location.href = 'login.html';
                return;
            }

            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error(error);
            showMessage('회원가입 처리 중 오류가 발생했습니다.', true);
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = '회원가입';
        }
    });
});
