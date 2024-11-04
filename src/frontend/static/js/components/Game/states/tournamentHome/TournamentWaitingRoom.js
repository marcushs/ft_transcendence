export default class TournamentWaitingRoom extends HTMLElement {
	constructor() {
		super();
		this.redirectState = "tournament-waiting-room";
		this.class = "tournament-waiting-room";
		// this.render();
	}

	render() {
		this.innerHTML = `
			<ul class="members-list">
				<li>Player1</li>
				<li>Player2</li>
				<li>Player3</li>
				<li>Player4</li>
				<li>Player5</li>
				<li>Player6</li>
			</ul>
			<button type="button">Leave</button>
			<button type="button">Ready</button>
		`;
	}
}

customElements.define('tournament-waiting-room', TournamentWaitingRoom);
