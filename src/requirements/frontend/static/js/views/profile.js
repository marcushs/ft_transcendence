import { disabled2fa } from "./two_factor/disable2fa.js";
import enableTwoFactor from "./two_factor/enable2fa.js"
import { getCookie } from "../utils/cookie.js";

export default () => {
    const html = `
        <h1>Profile:</h1>
        <div id="container"></div>
    `

    setTimeout(() => {
		getProfile();
	}, 0);
    return html
}

async function getProfile() { 
    const config = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
        },
        // mode: 'no-cors',
        credentials: 'include' // Needed for send cookie
    };
    try {
        const res = await fetch('http://localhost:8000/account/protected/', config);
        const data = await res.json();
        if (data.user) {
            displayUserInformation(data.user)
            console.log(document.cookie);
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
    container.innerHTML = `<p> Username: ${data.username} </p>
    <p> Email: ${data.email} </p>
    ${two_factor_inner}`
    twoFactorEventListener();
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