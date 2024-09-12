import { getCookie } from "../utils/cookie.js";
import { TwoFactorVerify } from '../views/two_factor/TwoFactorLoginVerify.js'
import { handleRedirection } from "../utils/handleRedirection.js";


class CustomBtn extends HTMLButtonElement {
    static get observedAttributes() {
        return ["text"];
    }

    constructor() {
        super();
        
        // Add a class to the button
        this.classList.add('btn');

        // Set default text
        this.text = 'text';

        // Set the initial text content
        this.textContent = this.text;

        // Bind the postData method to this instance
        this.addEventListener('click', this.postData.bind(this));

        this.type = 'submit';

        this.disabled = true;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'text') {
            this.text = newValue;
            this.textContent = this.text;
        }
    }

    async postData(event) {
        // Prevent form submission
        console.log('test')
        event.preventDefault();
        // Get the closest form element of the button
        const form = this.closest('form');
        if (form) {
            // Construct a FormData object, a set of key/value pairs
            const formData = new FormData(form);
            
            // formData.entries() return an iterator that traverse all the key/value pairs
            // Object.fromEntries() transforms a list of key-value pairs into an object
            const formValues = Object.fromEntries(formData.entries());
            const json = JSON.stringify(formValues);
            console.log(json);
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
                },
                credentials: 'include', // Needed for send cookie
                body: json, // Send form values as JSON
            };

            try {
                const res = await fetch(`/api/auth/${this.text.toLowerCase()}/`, config);
                if (res.status === 403)
                    throw new Error('Access Denied')
                const data = await res.json();
                console.log(data);
                if (res.status === 200) {
                    if (this.text.toLowerCase() === 'login' && data.is_verified === true)
                        new TwoFactorVerify(json);
                    else
                        handleRedirection(data.redirect_url)
                } else
                    alert(data.message)
            } catch (error) {
                console.log('Catch error :', error);
                alert(`Error: ${error.message}`)
            }
        } else {
            console.error('No form found!');
        }
    }
}

// Define the custom button element, specifying that it extends HTMLButtonElement
customElements.define("custom-btn", CustomBtn, { extends: "button" });
