import { getCookie } from "../utils/cookie.js";
import "../components/NavBar.js";

export default () => {
    const html = `
        <nav-bar auth="true"></nav-bar>
        <h1></h1>
        <div id="container"></div>
    `

    setTimeout(() => {
		getProfile();
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
        if (getCookie('authentificated')) {
            const container = document.getElementById('container');
            const welcome = document.querySelector('h1');
    
            welcome.textContent = `Welcome, ${data.user}`;
        }
        else {
            alert("You are not logged in");
            window.location.replace('login');
        }
    } catch (error) {
        console.log('Catch error :', error);
        alert(`Error: ${error.message}`)
    }
}
