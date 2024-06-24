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

function displayUserInformation (data) {
    const container = document.getElementById('container');
    const username = document.createElement('p');
    const email = document.createElement('p');
    const two_factor_setup = document.createElement('a')

    username.textContent = `Username: ${data.username}`;
    email.textContent = `Email: ${data.email}`;

    container.appendChild(username);
    container.appendChild(email);
    
    if (data.is_verified) {
        const two_factor_backup = document.createElement('a')
        two_factor_setup.id = 'backup'
        two_factor_setup.href = '2fa/backup'
        two_factor_setup.textContent = 'backup two-factor authentification'
        two_factor_setup.id = 'disable'
        two_factor_setup.href = '2fa/disabled'
        two_factor_setup.textContent = 'disabled two-factor authentification'
        container.appendChild(two_factor_setup);
        container.appendChild(two_factor_backup);

    } else {
        two_factor_setup.id = 'enable'
        two_factor_setup.href = '2fa/enable'
        two_factor_setup.textContent = 'enable two-factor authentification'
        container.appendChild(two_factor_setup);
    }

    two_factor_setup.addEventListener('click', async function(event) {
        event.preventDefault();
        if (event.target.id === 'disable') {
            console.log('Disable two-factor authentication logic');
        } else if (event.target.id === 'enable') {
            new enable2faHandler();
            history.pushState("", "", event.target.href);
            console.log('Enable two-factor authentication logic');
        } else {
            backup2fa();
            console.log('Backup two-factor authentication logic');
        }
    });
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