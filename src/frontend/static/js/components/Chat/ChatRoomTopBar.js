import getProfileImage from "../../utils/getProfileImage.js";
import { sendRequest } from "../../utils/sendRequest.js";

export default class ChatRoomTopBar extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-status"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-user')
            this.userData = JSON.parse(newValue);
        if (name === 'data-status')
            this.status = newValue;
	}

	constructor() {
		super();

		this.userData = null;
	};

	async connectedCallback() {
        await this.render();
		this.addEventListeners();
    }

	async render() {
		let profileImage = await getProfileImage(this.userData);
		let status = await this.getUserStatus();
		let isUserBlocked = await this.isTargetUserBlocked();

		console.log('isUserBlocked is: ', isUserBlocked)

		this.innerHTML = `
			<i id="chatroom-back-btn" class="fa-solid fa-arrow-left"></i>
			<div class="chatroom-profile-picture" style="background: no-repeat center/100% url('${profileImage}')">
				<div class="chat-status-circle ${status}"></div>
			</div>
			<div class="chat-contact-name-status">
				<p class="chatroom-top-bar-username">${this.userData.username}</p>
				<p class="${status}">${status}</p>
			</div>
			${this.userData.username !== "Tournament Bot" ? `
			<div id="chat-block-user" class="chat-block-user ${isUserBlocked ? 'blocked' : ''}">
				<p>
					<i class="fa-solid fa-ban"></i>
					<i class="fa-regular fa-circle-check"></i>
					<span>${isUserBlocked ? 'Unblock' : 'Block'} ${this.userData.username}</span>
				</p>
			</div>` : ''}
		`;

	};

	async getUserStatus() {
		if (this.userData.username === 'Tournament Bot') return 'online';
		try {
			let res = await sendRequest('GET', `/api/user/get_user_status/?userId=${this.userData.id}`, null, false);
			
			console.log('chatroom top bar: ', res.user_status)
			return res.user_status;
		} catch (error) {
		}
	}

	addEventListeners() {
		const chatBlockUser = this.querySelector('#chat-block-user');
		if (!chatBlockUser) return; 
		const chatBlockUserSpan = chatBlockUser.querySelector('span');

		chatBlockUser.firstElementChild.addEventListener('click', async () => {
			if (chatBlockUser.classList.contains('blocked')) {
				chatBlockUser.classList.remove('blocked');
				chatBlockUserSpan.innerText = `Block ${this.userData.username}`;
				this.unblockUser();
			} else {
				chatBlockUser.classList.add('blocked');
				chatBlockUserSpan.innerText = `Unblock ${this.userData.username}`;
				this.blockUser();
			}
		})
	}

	async isTargetUserBlocked() {
		try {
			if (this.userData.id === 'tournament_bot') return;
			let res = await sendRequest('GET', `/api/chat/is_user_blocked/?targetUserId=${this.userData.id}`, null, false);

			console.log('is targetuser blocked: ', res)
			if (res.message === "True") return true;
			return false;
		} catch (error) {
			
		}
	}

	async blockUser() {
		try {
			let res = await sendRequest('GET', `/api/chat/block_user/?blockedUserId=${this.userData.id}`, null, false);

			console.log("blocked user", res);
		} catch (error) {
			
		}
	} 

	async unblockUser() {
		try {
			let res = await sendRequest('GET', `/api/chat/unblock_user/?blockedUserId=${this.userData.id}`, null, false);

			console.log("unblocked user", res);
		} catch (error) {
			
		}
	} 
}

customElements.define('chatroom-top-bar', ChatRoomTopBar);
