export default () => {
    const html = `
        <h1></h1>
        <div id="container"></div>
    `

    setTimeout(() => {
		getProfile();
	}, 0);
}

async function getProfile() {
    const csrfToken = getCookie('csrftoken');
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        credentials: 'include'  // Include cookies with the request
    }
    const res = await fetch('http://localhost:8000/account/welcome', config);
    const data = await res.json();
    console.log(data);
    if (data.is_logged_in) {
        const container = document.getElementById('container');
        const welcome = document.createElement('h1');

        welcome.textContent = `Welcome, ${data.username}`;
        container.appendChild(welcome);
    }
    else {
        alert("You are not logged in");
        window.location.replace('login');
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