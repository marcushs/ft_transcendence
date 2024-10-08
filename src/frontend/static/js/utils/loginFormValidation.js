export default function checkFieldsCompleted() {
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const btn = document.querySelector('.generic-auth-btn-disabled');

    function inputsFilled() {
        if (usernameInput.value && passwordInput.value)
            btn.className = 'generic-auth-btn';
        else
            btn.className = 'generic-auth-btn-disabled';
    }
    usernameInput.addEventListener('input', inputsFilled);
    passwordInput.addEventListener('input', inputsFilled);
}