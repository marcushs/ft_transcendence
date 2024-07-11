import '../../components/two_factor_auth/TwoFactorDisableComponent.js'
import { isVerifiedUser } from '../../utils/isVerifiedUser.js'
import { handleRedirection } from '../../utils/handleRedirection.js'

export default () => {
    const html = ` <div class="container"></div> `;

    setTimeout(() => {
        initialize();
    }, 0);

    return html;
}

async function initialize() {
    const is_verified = await isVerifiedUser();
    console.log('test: ', is_verified)
    if (!is_verified && is_verified === false) {
        alert('you can\'t access this page, two-factor authentication is not active on your account');
        handleRedirection('profile');
    } else if (is_verified && is_verified === true) {
        const container = document.querySelector('.container');
        if (container)
            container.innerHTML = '<two-factor-disable-component></two-factor-disable-component>';
    }
}