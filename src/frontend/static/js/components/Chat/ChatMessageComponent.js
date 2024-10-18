export default class ChatMessageComponent extends HTMLElement {
	constructor(messageData) {
		super();
		this.messageData = messageData;
		this.render();
	}

	render() {
		this.innerHTML = `
		<div class="chat-message-container">
			<p class="chat-message-bubble">${this.messageData.message || this.messageData.body}</p>
			<div class="chat-message-info">
				<p class="chat-message-time">${this.messageData.timestamp || this.formatCreatedDatetime(this.messageData.created)}</p>
				<div class="chat-message-read unread">
					<i class="fa-solid fa-check"></i>
					<i class="fa-solid fa-check"></i>
				</div>
			</div>
		</div>
		`;
	}

	formatCreatedDatetime(created) {
		const date = new Date(created);
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
	  
		if (this.isSameDay(date, now)) {
		  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
		} else if (this.isSameDay(date, yesterday)) {
		  return 'Yesterday';
		} else {
		  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
		}
	  }
	  
	isSameDay(date1, date2) {
		return date1.getFullYear() === date2.getFullYear() &&
			   date1.getMonth() === date2.getMonth() &&
			   date1.getDate() === date2.getDate();
	  }
}

customElements.define('chat-message-component', ChatMessageComponent);
