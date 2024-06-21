import './PlayerInBracketComponent.js'

class bracket {

    constructor() {
        this.redirectState = "bracket";
        this.class = "bracket";

        this.temporaryPlayersList = {
            nbOfPlayers: 16,
            eighthFinal: [
                [
                    {name: 'Sowoo',score: '9'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '6'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '1'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '11'},
                    {name: 'Sowoo',score: '4'},
                ],
                [
                    {name: 'Sowoo',score: '11'},
                    {name: 'Sowoo',score: '10'},
                ],
                [
                    {name: 'Sowoo',score: '8'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '8'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '8'},
                    {name: 'Sowoo',score: '11'},
                ]
            ],
            quarterFinal: [
                [
                    {name: 'Sowoo',score: '9'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '6'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '1'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '11'},
                    {name: 'Sowoo',score: '4'},
                ],
            ],
            semiFinal: [
                [
                    {name: 'Sowoo',score: '1'},
                    {name: 'Sowoo',score: '11'},
                ],
                [
                    {name: 'Sowoo',score: '11'},
                    {name: 'Sowoo',score: '4'},
                ],
            ],
            final: [
                [
                    {name: 'Sowoo',score: '11'},
                    {name: 'Sowoo',score: '4'},
                ],
            ]
        }
    }

    generateBracket() {
        if (this.temporaryPlayersList.nbOfPlayers === 16) {
            return this.generateSixteenPlayersBracket();
        }
    }

    generateSixteenPlayersBracket() {
        let leftMatches = { content: '<div class="left-matches">' };
        let rightMatches = { content: '<div class="right-matches">' };
        let finalMatch = { content: '<div class="final-matches">' };

        this.generateEighthFinal(this.temporaryPlayersList.eighthFinal, leftMatches, rightMatches);
        console.log(leftMatches.content);
        this.generateQuarterFinal(this.temporaryPlayersList.quarterFinal, leftMatches, rightMatches);
        this.generateSemiFinal(this.temporaryPlayersList.semiFinal, leftMatches, rightMatches);
        this.generateFinal(this.temporaryPlayersList.final, finalMatch);

        leftMatches.content += '</div>';
        finalMatch.content += '</div>'
        rightMatches.content += '</div>';
        console.log(leftMatches.content + finalMatch.content + rightMatches.content)
        return leftMatches.content + finalMatch.content + rightMatches.content;
    }

    generateEighthFinal(eightFinal, leftMatches, rightMatches) {
        const leftMatch = eightFinal.slice(0, 4);
        const rightMatch = eightFinal.slice(4, 8);
        // let res = '';
        let playerInBracketNumber = 1;

        for (const match of leftMatch) {
            for (const player of match) {
                const playerClass = (player.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-game-win';

                leftMatches.content += `<player-in-bracket name="${player.name}" score="${player.score}" id="left-height-player${playerInBracketNumber}" class="${playerClass}"></player-in-bracket>`
                playerInBracketNumber++;
            }
        }
        playerInBracketNumber = 1;
        for (const match of rightMatch) {
            for (const player of match) {
                const playerClass = (player.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-game-win';

                rightMatches.content += `<player-in-bracket name="${player.name}" score="${player.score}" id="right-height-player${playerInBracketNumber}" class="${playerClass} right-players"></player-in-bracket>`
                playerInBracketNumber++;
            }
        }
        // return res;
    }

    generateQuarterFinal(fourFinal, leftMatches, rightMatches) {
        const leftMatch = fourFinal.slice(0, 2);
        const rightMatch = fourFinal.slice(2, 4);
        // let res = '';
        let playerInBracketNumber = 1;

        for (const match of leftMatch) {
            for (const player of match) {
                const playerClass = (player.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-game-win';

                leftMatches.content += `<player-in-bracket name="${player.name}" score="${player.score}" id="left-four-player${playerInBracketNumber}" class="${playerClass}"></player-in-bracket>`
                console.log(playerInBracketNumber);
                playerInBracketNumber++;
            }
        }
        playerInBracketNumber = 1;
        for (const match of rightMatch) {
            for (const player of match) {
                const playerClass = (player.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-game-win';

                rightMatches.content += `<player-in-bracket name="${player.name}" score="${player.score}" id="right-four-player${playerInBracketNumber}" class="${playerClass} right-players"></player-in-bracket>`
                playerInBracketNumber++;
            }
        }
        // return res;
    }

    generateSemiFinal(semiFinal, leftMatches, rightMatches) {
        const leftMatch = semiFinal.slice(0, 1);
        const rightMatch = semiFinal.slice(1, 2);
        // let res = '';
        let playerInBracketNumber = 1;

        for (const match of leftMatch) {
            for (const player of match) {
                const playerClass = (player.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-game-win';

                leftMatches.content += `<player-in-bracket name="${player.name}" score="${player.score}" id="left-two-player${playerInBracketNumber}" class="${playerClass}"></player-in-bracket>`
                playerInBracketNumber++;
            }
        }
        playerInBracketNumber = 1;
        for (const match of rightMatch) {
            for (const player of match) {
                const playerClass = (player.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-game-win';

                rightMatches.content += `<player-in-bracket name="${player.name}" score="${player.score}" id="right-two-player${playerInBracketNumber}" class="${playerClass} right-players"></player-in-bracket>`
                playerInBracketNumber++;
            }
        }
        // return res;
    }

    generateFinal(final, finalMatch) {
        const leftPlayer = final[0][0];
        const rightPlayer = final[0][1];
        // let res = '';

        let playerClass = (leftPlayer.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-tournament-win';
        finalMatch.content += `<player-in-bracket name="${leftPlayer.name}" score="${leftPlayer.score}" id="final-player1" class="${playerClass}"></player-in-bracket>`

        playerClass = (rightPlayer.score !== '11') ? 'player-in-bracket-basic' : 'player-in-bracket-tournament-win';
        finalMatch.content += `<player-in-bracket name="${rightPlayer.name}" score="${rightPlayer.score}" id="final-player2" class="${playerClass} right-players"></player-in-bracket>`

        // return res;
    }

    render() {
        return `
            ${this.generateBracket()};
<!--            <div class="left-matches">-->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-height-player1" class="player-in-bracket-himself"></player-in-bracket>-->
<!--                <player-in-bracket name="Hleung" score="1" id="left-height-player2" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Acarlott" score="7" id="left-height-player3" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Pgouasmi" score="11" id="left-height-player4" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Chonorat" score="8" id="left-height-player5" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Eguelin" score="11" id="left-height-player6" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Natterie" score="11" id="left-height-player7" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Tduprez" score="9" id="left-height-player8" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                -->
<!--                <player-in-bracket name="Sowoo" score="10" id="left-four-player1" class="player-in-bracket-himself"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-four-player2" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="9" id="left-four-player3" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-four-player4" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                -->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-two-player1" class="player-in-bracket-himself"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="10" id="left-two-player2" class="player-in-bracket-basic"></player-in-bracket>-->
<!--            </div>-->
<!--            <div class="final-matches">-->
<!--                <player-in-bracket name="Sowoo" score="11" id="final-player1" class="player-in-bracket-tournament-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="9" id="final-player2" class="player-in-bracket-basic"></player-in-bracket>-->
<!--            </div>-->
<!--            <div class="right-matches">-->
<!--                <player-in-bracket name="Sowoo" score="11" id="right-height-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Hleung" score="1" id="right-height-player2" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Acarlott" score="7" id="right-height-player3" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Pgouasmi" score="11" id="right-height-player4" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Chonorat" score="8" id="right-height-player5" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Eguelin" score="11" id="right-height-player6" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Natterie" score="11" id="right-height-player7" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Tduprez" score="9" id="right-height-player8" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                -->
<!--                <player-in-bracket name="Test" score="11" id="right-four-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="WWWWWWWWWWWW" score="7" id="right-four-player2" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="8" id="right-four-player3" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="11" id="right-four-player4" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                -->
<!--                <player-in-bracket name="Sowoo" score="11" id="right-two-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Ceci est un test3" score="8" id="right-two-player2" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--            </div>-->
		`;
    }
}

export default bracket;