import './PlayerInBracketComponent.js'

class bracket {

    constructor() {
        this.redirectState = "bracket";
        this.class = "bracket";
    }

    render() {
        return `
            <div class="left-matches">
                <player-in-bracket name="Sowoo" score="11" id="left-height-player1" class="player-in-bracket-himself"></player-in-bracket>
                <player-in-bracket name="Hleung" score="1" id="left-height-player2" class="player-in-bracket-basic"></player-in-bracket>
                <player-in-bracket name="Acarlott" score="7" id="left-height-player3" class="player-in-bracket-basic"></player-in-bracket>
                <player-in-bracket name="Pgouasmi" score="11" id="left-height-player4" class="player-in-bracket-game-win"></player-in-bracket>
                <player-in-bracket name="Chonorat" score="8" id="left-height-player5" class="player-in-bracket-basic"></player-in-bracket>
                <player-in-bracket name="Eguelin" score="11" id="left-height-player6" class="player-in-bracket-game-win"></player-in-bracket>
                <player-in-bracket name="Natterie" score="11" id="left-height-player7" class="player-in-bracket-game-win"></player-in-bracket>
                <player-in-bracket name="Tduprez" score="9" id="left-height-player8" class="player-in-bracket-basic"></player-in-bracket>
                
                <player-in-bracket name="Sowoo" score="10" id="left-four-player1" class="player-in-bracket-himself"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="11" id="left-four-player2" class="player-in-bracket-game-win"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="9" id="left-four-player3" class="player-in-bracket-basic"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="11" id="left-four-player4" class="player-in-bracket-game-win"></player-in-bracket>
                
                <player-in-bracket name="Sowoo" score="11" id="left-two-player1" class="player-in-bracket-himself"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="10" id="left-two-player2" class="player-in-bracket-basic"></player-in-bracket>
            </div>
            <div class="final-matches">
                <player-in-bracket name="Sowoo" score="11" id="final-player1" class="player-in-bracket-tournament-win right-players"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="9" id="final-player2" class="player-in-bracket-basic"></player-in-bracket>
            </div>
            <div class="right-matches">
                <player-in-bracket name="Sowoo" score="11" id="right-height-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>
                <player-in-bracket name="Hleung" score="1" id="right-height-player2" class="player-in-bracket-basic right-players"></player-in-bracket>
                <player-in-bracket name="Acarlott" score="7" id="right-height-player3" class="player-in-bracket-basic right-players"></player-in-bracket>
                <player-in-bracket name="Pgouasmi" score="11" id="right-height-player4" class="player-in-bracket-game-win right-players"></player-in-bracket>
                <player-in-bracket name="Chonorat" score="8" id="right-height-player5" class="player-in-bracket-basic right-players"></player-in-bracket>
                <player-in-bracket name="Eguelin" score="11" id="right-height-player6" class="player-in-bracket-game-win right-players"></player-in-bracket>
                <player-in-bracket name="Natterie" score="11" id="right-height-player7" class="player-in-bracket-game-win right-players"></player-in-bracket>
                <player-in-bracket name="Tduprez" score="9" id="right-height-player8" class="player-in-bracket-basic right-players"></player-in-bracket>
                
                <player-in-bracket name="XX_test_duXX" score="11" id="right-four-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>
                <player-in-bracket name="WWWWWWWWWWWW" score="7" id="right-four-player2" class="player-in-bracket-basic right-players"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="8" id="right-four-player3" class="player-in-bracket-basic right-players"></player-in-bracket>
                <player-in-bracket name="Sowoo" score="11" id="right-four-player4" class="player-in-bracket-game-win right-players"></player-in-bracket>
                
                <player-in-bracket name="Sowoo" score="11" id="right-two-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>
                <player-in-bracket name="Ceci est un test3" score="8" id="right-two-player2" class="player-in-bracket-basic right-players"></player-in-bracket>
            </div>
		`;
    }
}

export default bracket;