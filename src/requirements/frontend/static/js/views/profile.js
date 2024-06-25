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
        console.log(data)
        if (getCookie('authenticated') && !data.error) {
            const container = document.getElementById('container');
            const welcome = document.querySelector('h1');
            const profilePic = document.createElement('div');
            const cssLink = document.createElement('link');

            cssLink.setAttribute('rel', 'stylesheet');
            cssLink.setAttribute('href', '../../style/views/profile.css');
            profilePic.classList.add('pic');
            profilePic.style.background = `url('${data.user.profile_image}') no-repeat center center/cover`;
            container.appendChild(profilePic);
    
            welcome.textContent = `Welcome, ${data.user.username}`;
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
