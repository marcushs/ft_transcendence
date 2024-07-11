import '../../components/two_factor_auth/TwoFactorEnableComponent.js'
import { handleRedirection } from '../../utils/handleRedirection.js'
import { isVerifiedUser } from '../../utils/isVerifiedUser.js'

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
    if (is_verified && is_verified === true) {
        alert('you cant access this page, you have already setup two factor authentication on your account')
        handleRedirection('profile');
    } else if (!is_verified && is_verified === false) {
        const container = document.querySelector('.container');
        if (container)
            container.innerHTML = '<two-factor-enabler-component></two-factor-enabler-component>';
    }
}