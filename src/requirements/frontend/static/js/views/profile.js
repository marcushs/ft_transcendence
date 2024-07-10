import { getCookie } from "../utils/cookie.js";
import enableTwoFactor from "./two_factor/enable2fa.js"
import "../components/NavBar.js";

export default () => {
    const html = `
        <nav-bar auth="true"></nav-bar>
        <h1></h1>
        <div id="container"></div>
    `

    setTimeout(() => {
		getProfile();
        addStyleToView();
	}, 0);

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
        const res = await fetch('http://localhost:8000/account/protected/', config);
        const data = await res.json();
        console.log(data)
        if (data.user && !data.error) {
            generateProfilePage(data);
            // displayUserInformation(data.user) 
        }
        else {
            console.log(data.error)
            alert("You are not logged in");
            window.location.replace('login');
        }
    } catch (error) {
        console.log('Catch error :', error);
        alert(`Error: ${error.message}`)
    }
}

function displayUserInformation (data) {
    const container = document.getElementById('container');
    let two_factor_inner = null;

    if (data.is_verified) {
        two_factor_inner = `
            <a href=/2fa/backup id=backup>backup two_factor authentification</a>
            <a href=/2fa/disable id=disable>disable two_factor authentification</a>
        `
    } else {
        two_factor_inner = `
            <a href=/2fa/enable id=enable>enable two_factor authentification</a>
        `
    }
    container.innerHTML += `${two_factor_inner}` 
    twoFactorEventListener();
}

function addStyleToView() {
    const cssLink = document.createElement('link');

    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute('href', '../../style/views/profile.css');
    document.head.appendChild(cssLink);
}

function twoFactorEventListener () {
    const container = document.getElementById('container');
    container.addEventListener('click', async function(event) {
        event.preventDefault();
        switch (event.target.id) {
            case 'enable':
                history.pushState("", "", event.target.href);
                app.innerHTML = enableTwoFactor();
                break;
            case 'disable':
                disabled2fa();
                break;
            case 'backup':
                backup2fa();
                break;
        }
    });
}   


function generateProfilePage(data) {
    const container = document.getElementById('container');
    const welcome = document.querySelector('h1');
    const profilePic = document.createElement('div');
    const score = document.createElement('h3');
    const anchor = document.createElement('a');
    const infoCollapse = document.createElement('div');
    
    welcome.textContent = `Welcome, ${data.user.username}`;
    
    profilePic.classList.add('pic');
    profilePic.style.background = `url('${data.user.profile_image}') no-repeat center center/cover`;
    
    score.textContent = `Score: ${data.user.score}`;
    
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
    <a href="/2fa/enable" data-link class="enableBtn">Enable 2FA</a>
    `;
    
    container.appendChild(profilePic);
    container.appendChild(score);
    container.appendChild(anchor);
    container.appendChild(infoCollapse);

    anchor.addEventListener('click', () => infoCollapse.classList.toggle('collapse'));
}

