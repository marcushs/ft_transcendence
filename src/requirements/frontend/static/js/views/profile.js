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
            // const container = document.getElementById('container');
            // const welcome = document.createElement('h1');
    
            // welcome.textContent = `Welcome, ${data.username}`;
            // container.appendChild(welcome);
            alert(`Welcome ${data.user}, you are now logged in`);
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
