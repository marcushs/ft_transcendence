import './PlayerInBracketComponent.js'

class bracket {

    constructor() {
        this.redirectState = "bracket";
        this.class = "bracket";
    }

    render() {
        return `
			<player-in-bracket name="Sowoo" score="11" class="player-in-bracket-basic"></player-in-bracket>
			<player-in-bracket name="Sowoo" score="11" class="player-in-bracket-game-win"></player-in-bracket>
			<player-in-bracket name="Sowoo" score="11" class="player-in-bracket-tournament-win"></player-in-bracket>
		`;
    }
}

export default bracket;