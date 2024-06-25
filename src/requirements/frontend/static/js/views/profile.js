import { disabled2fa } from "./two_factor/disable2fa.js";
import enable2faHandler from "./two_factor/enable2fa.js"

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

// function displayJSON(user) {
//     const container = document.getElementById('container');
//     const userInformation = document.createElement('p');

//     userInformation.textContent = JSON.stringify(user);

//     container.appendChild(userInformation);
// }

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
            // displayJSON(data.user)
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
    const username = document.createElement('p');
    const email = document.createElement('p');
    const two_factor_inner = document.createElement('a')

    username.textContent = `Username: ${data.username}`;
    email.textContent = `Email: ${data.email}`;

    container.appendChild(username);
    container.appendChild(email);
    
    if (data.is_verified) {
        const two_factor_backup = document.createElement('a')
        two_factor_inner.id = 'backup'
        two_factor_inner.href = '2fa/backup'
        two_factor_inner.textContent = 'backup two-factor authentification'
        two_factor_inner.id = 'disable'
        two_factor_inner.href = '2fa/disabled'
        two_factor_inner.textContent = 'disabled two-factor authentification'
        container.appendChild(two_factor_inner);
        container.appendChild(two_factor_backup);
    } else {
        two_factor_inner.id = 'enable'
        two_factor_inner.href = '2fa/enable'
        two_factor_inner.textContent = 'enable two-factor authentification'
        container.appendChild(two_factor_inner);
    }
    twoFactorEventListener(two_factor_inner);
}

function twoFactorEventListener (two_factor_inner) {
    two_factor_inner.addEventListener('click', async function(event) {
        event.preventDefault();
        switch (event.target.id) {
            case 'enable':
                history.replaceState("", "", "profile/");
                history.pushState("", "", event.target.href);
                new enable2faHandler();
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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}