import "../components/NavBarComponent.js"
import "../components/Profile/ProfileComponent.js"
import { getCookie } from "../utils/cookie.js";
import "../components/NavBarComponent.js";

export default () => {
    const html = `
        <section class="profile-page">
            <nav-bar-component></nav-bar-component>
            <div class="profile-main-section">
                <profile-component state="personalInformation"></profile-component>
            </div>
        </section>
    `;

    return html;
}
async function getProfile() { 
    const config = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
        },
        credentials: 'include' // Needed for send cookie
    };
    try {
        const res = await fetch('/api/user/user_info/', config);
        const data = await res.json();
        console.log(data)
        if (res.status === 200) {
            generateProfilePage(data);
        }
        else {
            alert(data.message);
            window.location.replace('login');
        }
    } catch (error) { 
        console.log('Error :', error);
        alert(`Error: ${error.message}`)
    }
}

function addStyleToView() {
    const cssLink = document.createElement('link');

    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute('href', '../../style/views/profile.css');
    document.head.appendChild(cssLink);
}

function generateProfilePage(data) {
    const container = document.getElementById('container');
    const welcome = document.querySelector('h1');
    const profilePic = document.createElement('div');
    const score = document.createElement('h3');
    
    welcome.textContent = `Welcome, ${data.user.username}`;
    
    profilePic.classList.add('pic');
    profilePic.style.background = `url('${data.user.profile_image}') no-repeat center center/cover`;
    
    score.textContent = `Score: ${data.user.score}`;
    
    container.appendChild(profilePic);
    container.appendChild(score);
    displayTwoFactorChoice(data);
}

function displayTwoFactorChoice(data) {
    const container = document.getElementById('container');
    const anchor = document.createElement('a');
    const infoCollapse = document.createElement('div');

    if (data.user.is_verified) {
        anchor.innerText = "Two-factor authentication (2FA)";
    
        infoCollapse.classList.add('info');
        infoCollapse.innerHTML = `
        <a href="/twofactor/disable" data-link class="enableBtn">Disable 2FA</a>
        `;
    } else {
        anchor.innerText = "Two-factor authentication (2FA)";
    
        infoCollapse.classList.add('info');
        infoCollapse.innerHTML = `
        <p>
            Prior to configuring two-factor authentication, please read the following article carefully:
            <a href="https://www.microsoft.com/en-us/security/business/security-101/what-is-two-factor-authentication-2fa">What is 2FA Authentication ?</a>
            <br>
            Supported applications: FreeOTP, Google Authenticator
            <br>
            ⚠️ You will receive an email with a link. Please follow the instructions to complete the two-factor authentication setup.
            <br>
        </p>
        <a href="/twofactor/enable" data-link class="enableBtn">Enable 2FA</a>
        `;
    }
    anchor.addEventListener('click', () => infoCollapse.classList.toggle('collapse'));
    container.appendChild(anchor);
    container.appendChild(infoCollapse);
}
