class matchmakingChoice {

	constructor() {
		this.redirectState = "matchmaking-choice";
		this.class = "matchmaking-choice";
		this.context = "/";
	}

	render() {
		return `
			<p state-redirect tournament-home>Tournament</p>
			<p state-redirect online-home>Online</p>
			<p state-redirect local-home>Local</p>
		`;
	}
}


export default matchmakingChoice;