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
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'text') {
            this.text = newValue;
            this.textContent = this.text;
        }
    }

    async getData() {
        const config = {
            headers: {
                'Accept': 'application/json'
            }
        }
        try {
            const res = await fetch(`http://localhost:8000/account/${this.text.toLowerCase()}`, config);
            const data = await res.json();
            console.log(data.message);
        } catch (error) {
            console.error('Network error:', error);
            // Handle the error, such as displaying an error message to the user
        }
    }
}

// Define the custom button element, specifying that it extends HTMLButtonElement
customElements.define("custom-btn", CustomBtn, { extends: "button" });
