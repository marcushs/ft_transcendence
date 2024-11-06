export default class TournamentWaitingRoom {
	constructor(tournamentData) {
		this.redirectState = "tournament-waiting-room";
		this.class = "tournament-waiting-room";
		this.tournamentId = tournamentData.tournament_id;
		this.tournamentName = tournamentData.tournament_name;
		this.tournamentSize = tournamentData.tournament_size;
		this.tournamentCreator = tournamentData.creator.username;
		this.tournamentMemberCount = tournamentData.member_count;
	}

	render() {
		return `
			<div class="waiting-room" data-tournament="${this.tournamentId}">
				<h3 class="waiting-room-title">Waiting Room</h3>
				<div class="waiting-room-background">
					<div class="waiting-room-content">
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>Creator: <span>${this.tournamentCreator}</span></p>
						<p>Joined players: <span id="tournament-waiting-room-joined-players">${this.tournamentMemberCount} / ${this.tournamentSize}</span></p>
						<button type="button" class="leave-tournament-button">Leave</button>
					</div>
				</div>
			</div>
		`;	
	}
}
