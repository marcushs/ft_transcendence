export function checkFieldsCompleted() {
    const usernameInput = document.getElementById('username');
    const pwInput = document.getElementById('password');
    const btn = document.querySelector('button');

    function inputsFilled() {
        if (usernameInput.value && pwInput.value)
            btn.disabled = false;
        else
            btn.disabled = true;
    }
    usernameInput.addEventListener('input', inputsFilled);
    pwInput.addEventListener('input', inputsFilled);
}