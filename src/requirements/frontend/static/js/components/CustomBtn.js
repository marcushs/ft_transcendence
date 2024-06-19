import index from "../views/index.js";
import { getCookie } from "../utils/cookie.js";

class CustomBtn extends HTMLButtonElement {
    static get observedAttributes() {
        return ["text"];
    }

    constructor() {
        super();
        
        // Set default text
        this.text = 'text';

        // Add a class to the button
        this.classList.add('btn');

        // Set the initial text content
        this.textContent = this.text;

        // Bind the getData method to this instance
        this.addEventListener('click', this.getData.bind(this));

        this.type = 'button';
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'text') {
            this.text = newValue;
            this.textContent = this.text;
        }
    }

    async getData(event) {
        // Prevent form submission
        event.preventDefault();

        // Get the closest form element of the button
        const form = event.target.form;
        if (form) {
            // Construct a FormData object, a set of key/value pairs
            const formData = new FormData(form);
            
            // formData.entries() return an iterator that traverse all the key/value pairs
            // Object.fromEntries() transforms a list of key-value pairs into an object
            
            const formValues = Object.fromEntries(formData.entries()); 

            const json = JSON.stringify(formValues);
            console.log('(CustomBtn)-> json: ', json)
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
                },
                credentials: 'include', // Needed for send cookie
                body: JSON.stringify(formValues), // Send form values as JSON
            };

            try {
                const res = await fetch(`http://localhost:8000/account/${this.text.toLowerCase()}/`, config);
                if (res.status == 403)
                    throw new Error('Access Denied')
                const data = await res.json();
                if (!res.ok)
                    throw new Error(`${res.status} - ${data.error}`);
                history.replaceState("", "", "/");
                document.title = "Index";
                app.innerHTML = index();
                alert(data.message);
            } catch (error) {
                if (error.data && error.data.status === 'jwt_failed') {
                    history.replaceState("", "", "/");
                    document.title = "Index";
                    app.innerHTML = index();
                }
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
