import "./ChatContactComponent.js"
import { getUserId, fetchChatroomsList } from "../../utils/chatUtils/joinRoomUtils.js";
import ChatContactComponent from "./ChatContactComponent.js";
import {getString} from "../../utils/languageManagement.js";
import { sendRequest } from "../../utils/sendRequest.js";

class ChatContactList extends HTMLElement {	
	constructor() {
		super();
		this.count = 0;
		this.render();
		this.addEventListeners();
		setTimeout(() => {
			this.putContactListToDom();
			this.putFriendsList();
		}, 0);
	}

	render() {
		this.type = this.getAttribute("type");
		this.innerHTML = `
			<div class='contacted-list' id=${this.type === "contacted" ? "contactedList" : "contactList"}>
				<div class="list-header">
					<div class='plus-sign'>
						<div class="horizontal-line"></div>
						<div class="vertical-line"></div>
					</div>
					<p class="title">${getString(`chatComponent/${this.type}`)}</p>
					<p id="chat-contact-count" class="count" style="${(this.type === 'contact') ? 'visibility: hidden' : ''}">(0)</p>
					</div>
				<ul>
					<li><p class="no-contact-text">${(this.type === 'contacted') ? getString("chatComponent/noRecentMessage") : getString('chatComponent/noContacts')}</p></li>
				</ul>
			</div>
		`;
	}

	addEventListeners() {
		this.contactedList = this.querySelector('.contacted-list');
		this.listHeader = this.querySelector('.list-header');
		this.plusSign = this.querySelector('.plus-sign');

		this.listHeader.addEventListener('mouseenter', () => this.plusSign.classList.add('hover'));
		this.listHeader.addEventListener('mouseleave', () => this.plusSign.classList.remove('hover'));
		this.listHeader.addEventListener('click', () => {
			this.contactedList.classList.toggle('active');
		});

		document.addEventListener('contactsInfosChangedEvent', () => {
			this.putFriendsList();
		});
	}

	async putContactListToDom() {
		let chatroomsList = await fetchChatroomsList();
		let contactCount = chatroomsList.length;

		if (contactCount === 0) return ;

		const userId = await getUserId();
		const contactedListUl = document.querySelector('.contacted-list > ul');
		const chatContactCountEl = document.getElementById('chat-contact-count');

		if (chatContactCountEl)
			chatContactCountEl.innerText = `(${contactCount})`;
		if (contactedListUl)
			contactedListUl.innerHTML = '';
		else
			return;

		chatroomsList.forEach(chatroom => {
			let user_data = userId === chatroom.members[0].id ? chatroom.members[1] : chatroom.members[0];

			const listElem = document.createElement('li');
			const contactComp = new ChatContactComponent(user_data, chatroom.id, "contacted");

			contactComp.setAttribute('data-chatroom', chatroom.id);
			contactComp.setAttribute('data-user', JSON.stringify(user_data));
			listElem.appendChild(contactComp);
			contactedListUl.appendChild(listElem);
		});
	}

	async putFriendsList() {
		const contacts = await this.getDataRequest('search_contacts');
		const contactsData = await this.getDataRequest('users_data', contacts.friends);

		const contactedListUl = document.querySelector('#contactList > ul');

		contactedListUl.innerHTML = '';

		contactsData.forEach(contact => {
			const listElem = document.createElement('li');
			const contactComp = new ChatContactComponent(contact, contact.id, "contact");

			contactComp.setAttribute('data-chatroom', contact.id);
			contactComp.setAttribute('data-user', JSON.stringify(contact));
			listElem.appendChild(contactComp);
			contactedListUl.appendChild(listElem);
		});
	}

	addOneToCount() {
		this.count++;

		const chatContactCountEl = this.querySelector('#chat-contact-count');
	
		chatContactCountEl.innerText = `(${this.count})`;
	}

	subtractOneFromCount() {
		this.count--;
		this.count <= 0 ? this.count = 0 : this.count = this.count;

		const chatContactCountEl = this.querySelector('#chat-contact-count');
	
		chatContactCountEl.innerText = `(${this.count})`;
		if (this.count === 0) {
			const contactedListUl = document.querySelector('.contacted-list > ul');
			contactedListUl.innerHTML = `<li><p class="no-contact-text">${getString("chatComponent/noRecentMessage")}</p></li>`;
		}
	}

	async getDataRequest(requestType, payload) {
		let url = null;
		if (requestType === 'search_contacts')
			url = `/api/friends/search_contacts/`;
		else if (requestType === 'users_data') {
			const encodedList = encodeURIComponent(JSON.stringify(payload));
			url = `/api/user/get_users_info/?q=${encodedList}`
		}
		try {
			const data = await sendRequest('GET', url, null);
			if (data.status === 'success') {
				return data.message;
			} else {
				return null;
			}
		} catch (error) {
			return null;
		}
	}
}

customElements.define('chat-contact-list', ChatContactList);
