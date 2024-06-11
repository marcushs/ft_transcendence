class Btn extends HTMLElement {
    constructor(text) {
        super();
        
        this.innerHTML = /*html*/`
            <button class="btn" type="button">${text}</button>
        `;

        let btn = this.querySelector("button");

        // State
        btn.addEventListener('click', this.getData.bind(this));
    }

	async getData() {
		const config = {
			headers: {
				'Accept': 'application/json'
			}
		}
		try {
			const res = await fetch(`http://localhost:8000/account/${text}`, config);
			const data = await res.json();
			console.log(data.message);
		} catch (error) {
			console.error('Network error:', error);
			// Handle the error, such as displaying an error message to the user
		}
	}
}

customElements.define("btn", Btn);
