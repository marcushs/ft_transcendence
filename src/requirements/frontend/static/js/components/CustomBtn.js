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

        this.type = 'submit';

        this.disabled = true;
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
        const form = this.closest('form');
        if (form) {
            // Construct a FormData object, a set of key/value pairs
            const formData = new FormData(form);

            // formData.entries() return an iterator that traverse all the key/value pairs
            // Object.fromEntries() transforms a list of key-value pairs into an object

            const formValues = Object.fromEntries(formData.entries());
            // checkFormValues(formValues);
            const json = JSON.stringify(formValues);
            console.log(json)
            if (json['password'] !== json['confirm_password']) {
                console.log("passwords do not match");
                return ;
            }
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'X-CSRFToken': getCookie('csrftoken')    
                },
                body: JSON.stringify(formValues), // Send form values as JSON
            };

            try {
                const res = await fetch(`http://localhost:8000/account/${this.text.toLowerCase()}/`, config);
                const data = await res.json();
                console.log(data.message);
            } catch (error) {
                console.error('Network error:', error);
                // Handle the error, such as displaying an error message to the user
            }
        } else {
            console.error('No form found!');
        }
    }
}

// Define the custom button element, specifying that it extends HTMLButtonElement
customElements.define("custom-btn", CustomBtn, { extends: "button" });

// for csrf token header
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
