import "./ChatContactComponent.js"
import { sendRequest } from "../../utils/sendRequest.js";
import { getUserId, fetchChatroomsList } from "../../utils/chatUtils/joinRoomUtils.js";
import ChatContactComponent from "./ChatContactComponent.js";

class ChatContactList extends HTMLElement {	
	constructor() {
		super();
		this.count = 0;
		this.render();
		this.addEventListeners();
		this.putContactListToDom();
	}

	render() {
		this.innerHTML = `
			<div class='contacted-list'>
				<div class="list-header">
					<div class='plus-sign'>
						<div class="horizontal-line"></div>
						<div class="vertical-line"></div>
					</div>
					<p class="title">Contacted</p>
					<p id="chat-contact-count" class="count">(0)</p>
					</div>
				<ul>
					<li><p class="no-contact-text">No recent message</p></li>
				</ul>
			</div>
		`;
	}

	captitalize(str) {
		return str[0].toUpperCase() + str.slice(1)
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
	}

	async putContactListToDom() {
		let chatroomsList = await fetchChatroomsList();
		let contactCount = chatroomsList.length;

		if (contactCount === 0) return ;
		
		const userId = await getUserId();
		const contactedListUl = document.querySelector('.contacted-list > ul');
		const chatContactCountEl = document.getElementById('chat-contact-count');
	
		chatContactCountEl.innerText = `(${contactCount})`;
		contactedListUl.innerHTML = '';
	
		chatroomsList.forEach(chatroom => { 
			console.log('userId: ', userId, 'chatroom.members[0].id: ', chatroom.members[0].id, 'chatroom.members[1].id: ', chatroom.members[1].id)
			let user_data = userId === chatroom.members[0].id ? chatroom.members[1] : chatroom.members[0];
	
			console.log('------------> ' + user_data);
			const listElem = document.createElement('li');
			console.log(chatroom.id)
			const contactComp = new ChatContactComponent(user_data, chatroom.id);
	
			console.log(contactComp);
			contactComp.setAttribute('data-chatroom', chatroom.id);
			contactComp.setAttribute('data-user', JSON.stringify(user_data));
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
			contactedListUl.innerHTML = '<li><p class="no-contact-text">No recent message</p></li>';
		}
	}
}

customElements.define('chat-contact-list', ChatContactList);
