import { getCookie } from "../../utils/cookie.js";

export default () => {
    const html = `
        <div id="container"></div>
    `

    setTimeout(() => {
		enableTwoFactorAuthentication();
	}, 0);
    return html
}

let currentStep = 0;

const steps = [
    {
        html: `
            <h2>Enable Two-Factor Authentication</h2>
            <p>You are about to take your account security to the next level.</p>
            <p>Follow the steps in this wizard to enable two-factor authentication.</p>
            <button id="backButton">Back</button>
            <button id="nextButton">Next</button>
        `,
        onNext: () => currentStep++,
        onBack: () => currentStep--,
    },
    {
        html: `
            <h2>Enable Two-Factor Authentication</h2>
            <p>Please choose your two-factor authentication method:</p>
            <select id="methodSelect">
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="authenticator">Authenticator App</option>
            </select>
            <button id="backButton">Back</button>
            <button id="nextButton">Next</button>
        `,
        onNext: () => currentStep++,
        onBack: () => currentStep--,
    },
    {
        html: `
            <h2>Enable Two-Factor Authentication</h2>
            <p>step for verification with request</p>
            <button id="backButton">Back</button>
            <button id="nextButton">Next</button>
        `,
        onNext: () => {
            currentStep++;
            // enableTwoFactorRequest();
        },
        onBack: () => currentStep--,
    },
    {
        html: `
            <h2>Enable Two-Factor Authentication</h2>
            <p>You have successfully set up two-factor authentication!</p>
            <button id="nextButton">Finish</button>
        `,
        onNext: () => {
            currentStep++;
            console.log('2FA setup complete');
        },
        onBack: () => currentStep--,
    },
];

export async function enableTwoFactorAuthentication() {
    const container = document.getElementById('container');
    
    if (currentStep < steps.length && currentStep >= 0)
        container.innerHTML = steps[currentStep].html
    else {
        history.replaceState("", "", "/");
        window.location.replace('profile');
    }
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            steps[currentStep].onNext();
            enableTwoFactorAuthentication();
        });
        };
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            steps[currentStep].onBack();
            enableTwoFactorAuthentication();
        });
    }
}

async function enableTwoFactorRequest() {
    const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
        },
        credentials: 'include' // Needed for send cookie
    };
    try {
        const res = await fetch(`http://localhost:8000/account/2fa/enable/`, config);
        if (res.status == 403)
            throw new Error('Access Denied')
        const data = await res.json();
        if (data.user)
        console.log('enter in enable backend succesfully')
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
