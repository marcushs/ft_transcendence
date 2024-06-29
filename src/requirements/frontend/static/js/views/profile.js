import { getCookie } from "../utils/cookie.js";
import enableTwoFactor from "./two_factor/enable2fa.js"
import { disableTwoFactor } from "./two_factor/disable2fa.js"
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
            const container = document.getElementById('container');
            const welcome = document.querySelector('h1');
            const profilePic = document.createElement('div');
            const score = document.createElement('h3');
            
            profilePic.classList.add('pic');
            profilePic.style.background = `url('${data.user.profile_image}') no-repeat center center/cover`;
            
            welcome.textContent = `Welcome, ${data.user.username}`;
            score.textContent = `Score: ${data.user.score}`;
            container.appendChild(profilePic);
            container.appendChild(score);
            displayUserInformation(data.user)
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
                disableTwoFactor();
                break;
            case 'backup':
                backup2fa();
                break;
        }
    });
}   