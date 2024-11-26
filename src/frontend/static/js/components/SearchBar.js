import typeAndReplaceWords from "../anim/typeAndReplaceWords.js";
import {getString} from "../utils/languageManagement.js";
import { sendRequest } from "../utils/sendRequest.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";

class SearchBarComponent extends HTMLDivElement {
    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super();

        this.innerHTML = `
            <div class="search-bar">
                <form action="#" autocomplete="off">
                    <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                    <div class="search-bar-input-container">
                        <input type="text" placeholder="${getString('searchBarComponent/search')} " id="searchBarInput"/>
                        <ul id="searchResults" class="search-results"></ul>
                    </div>
                </form>
             </div>
        `;

        this.classList.add('component');
        this.searchInput = this.querySelector('#searchBarInput');
        this.searchResults = this.querySelector('#searchResults');
        this.searchResults.style.display = 'none';
        this.searchInput.addEventListener('input', () => this.handleSearch());
    }

    async handleSearch() {
        const value = this.searchInput.value;
        const usersList = await this.getUsersList(value);
        if (usersList !== null)
            this.displaySearchResult(usersList);
        else
            this.clearSearchResult();

    }

    async getUsersList(value) {
        const url = `/api/user/search_users/?q=${encodeURIComponent(this.searchInput.value)}`
        try {
            const data = await sendRequest('GET', url, null);
            if (data.status === 'success') {
                return data.message;
            } else {
                return null
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    displaySearchResult(usersList) {
        this.clearSearchResult();
        usersList.forEach(user => {
            const li = document.createElement('li');
            const p = document.createElement('p');
            p.textContent = user.username;
            li.appendChild(p);
            li.addEventListener('click', () => throwRedirectionEvent(`/users/${encodeURIComponent(user.username)}`) );
            this.searchResults.appendChild(li);
        });
        this.searchResults.style.display = 'block';
    }

    clearSearchResult() {
        this.searchResults.innerHTML = '';
        this.searchResults.style.display = 'none';
    }

    connectedCallback() {
	    typeAndReplaceWords();
    }
}

customElements.define("search-bar-component", SearchBarComponent, { extends: "div" });
