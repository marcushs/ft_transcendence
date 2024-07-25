import './PlayerInBracketComponent.js'

class bracket {

    constructor() {
        this.redirectState = "bracket";
        this.class = "bracket";

        this.temporaryPlayersList = {
            nbOfPlayers: 16,
            // eighthFinal: {
            //     leftMatches: [
            //         [
            //             {name: 'Sowoo', score: '8'},
            //             {name: 'Sowoo', score: '11'},
            //         ],
            //         [
            //             {name: 'Sowoo', score: '6'},
            //             {name: 'Sowoo', score: '11'},
            //         ],
            //         [
            //             {name: 'Sowoo', score: '1'},
            //             {name: 'Sowoo', score: '11'},
            //         ],
            //         [
            //             {name: 'Sowoo', score: '11'},
            //             {name: 'Sowoo', score: '4'},
            //         ],
            //     ],
            //     rightMatches: [
            //         [
            //             {name: 'Sowoo', score: '11'},
            //             {name: 'Sowoo', score: '10'},
            //         ],
            //         [
            //             {name: 'Sowoo', score: '8'},
            //             {name: 'Sowoo', score: '11'},
            //         ],
            //         [
            //             {name: 'Sowoo', score: '8'},
            //             {name: 'Sowoo', score: '11'},
            //         ],
            //         [
            //             {name: 'Sowoo', score: '8'},
            //             {name: 'Sowoo', score: '11'},
            //         ]
            //     ]
            // },
            eighthFinal: {
                leftMatches: [
                    [
                        {name: 'Sowoo', score: '8'},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Sowoo', score: '6'},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Sowoo', score: '1'},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Sowoo', score: '11'},
                        {name: 'Sowoo', score: '4'},
                    ],
                ],
                rightMatches: [
                    [
                        {name: 'Sowoo', score: '11'},
                        {name: 'Sowoo', score: '10'},
                    ],
                    [
                        {name: 'Sowoo', score: '8'},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Sowoo', score: '8'},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Sowoo', score: '8'},
                        {name: 'Sowoo', score: '11'},
                    ]
                ]
            },
            quarterFinal: {
                leftMatches: [
                    [
                        {name: 'Sowoo', score: '9'},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Sowoo', score: '6'},
                        {name: 'Sowoo', score: '11'},
                    ],
                ],
                rightMatches: [
                    [
                        {name: 'Sowoo', score: '11'},
                        {name: 'Sowoo', score: '10'},
                    ],
                    [
                        {name: 'Sowoo', score: '8'},
                        {name: 'Sowoo', score: '11'},
                    ],
                ]
            },
            semiFinal: {
                leftMatches: [
                    [
                        {name: 'Sowoo', score: '9'},
                        {name: 'Sowoo', score: '11'},
                    ],
                ],
                rightMatches: [
                    [
                        {name: 'Sowoo', score: '11'},
                        {name: 'Sowoo', score: '10'},
                    ],
                ]
            },
            final: [
                [
                    {name: 'Sowoo',score: '11'},
                    {name: 'Sowoo',score: '4'},
                ],
            ]
        }
        // this.generateBracket(this.temporaryPlayersList);
    }

    generateBracket(bracketObj) {
        let res = '';

        const leftBracket = {
            eighthFinal: bracketObj.eighthFinal.leftMatches,
            quarterFinal: bracketObj.quarterFinal.leftMatches,
            semiFinal: bracketObj.semiFinal.leftMatches
        }
        const rightBracket = {
            eighthFinal: bracketObj.eighthFinal.rightMatches,
            quarterFinal: bracketObj.quarterFinal.rightMatches,
            semiFinal: bracketObj.semiFinal.rightMatches
        }


        return `
            ${this.generateBracketSide(bracketObj.nbOfPlayers, leftBracket,  'left','left-matches')}
            ${this.generateBracketSide(bracketObj.nbOfPlayers, rightBracket, 'right', 'right-matches')}
        `;
    }


    generateBracketSide(nbOfPlayers, bracket, side, className) {
        let leftMatches = '';

        return `
            <div class="${className}">
                ${this.generateMatches(bracket.eighthFinal, `${side}-height-player`)}
                ${this.generateMatches(bracket.quarterFinal, `${side}-four-player`)}
                ${this.generateMatches(bracket.semiFinal, `${side}-two-player`)}
            </div>
        `
    }

    generateMatches(matches, idPrefix) {
        let index = 1;
        let matchesRes = '';

        for (const match of matches) {
            match.forEach(player => {
                if (player)
                    matchesRes += this.createPlayer(player,`${idPrefix}${index}`, (player.score === '11') ? `player-in-bracket-game-win` :  `player-in-bracket-basic`);
                else
                    matchesRes += this.createPlayer(player,`${idPrefix}${index}`, `no-player-in-bracket`);
                index++;
            });
        }

        return matchesRes;
    }

    createPlayer(player, id, className) {
        if (!player)
            return `<player-in-bracket name="" score="" id="${id}" class="${className}"></player-in-bracket>`;
        return `
            <player-in-bracket name="${player.name}" score="${player.score}" id="${id}" class="${className}"></player-in-bracket>
        `;
    }


    // updateBracket() {
    //
    // }

    render() {
        return `
            ${this.generateBracket(this.temporaryPlayersList)}
<!--             <div class="left-matches">-->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-height-player1" class="player-in-bracket-himself"></player-in-bracket>-->
<!--                <player-in-bracket name="Hleung" score="1" id="left-height-player2" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Acarlott" score="7" id="left-height-player3" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Pgouasmi" score="11" id="left-height-player4" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Chonorat" score="8" id="left-height-player5" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Eguelin" score="11" id="left-height-player6" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Natterie" score="11" id="left-height-player7" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Tduprez" score="9" id="left-height-player8" class="player-in-bracket-basic"></player-in-bracket>-->

<!--                <player-in-bracket name="Sowoo" score="10" id="left-four-player1" class="player-in-bracket-himself"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-four-player2" class="player-in-bracket-game-win"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="9" id="left-four-player3" class="player-in-bracket-basic"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="11" id="left-four-player4" class="player-in-bracket-game-win"></player-in-bracket>-->

<!--                <player-in-bracket name="Sowoo" score="11" id="left-two-player1" class="player-in-bracket-himself"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="10" id="left-two-player2" class="player-in-bracket-basic"></player-in-bracket>-->
<!--<player-in-bracket name="Sowoo" score="4" "id="left-height-player8" class="player-in-bracket-basic"></player-in-bracket>-->
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

<!--                <player-in-bracket name="Test" score="11" id="right-four-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="WWWWWWWWWWWW" score="7" id="right-four-player2" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="8" id="right-four-player3" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Sowoo" score="11" id="right-four-player4" class="player-in-bracket-game-win right-players"></player-in-bracket>-->

<!--                <player-in-bracket name="Sowoo" score="11" id="right-two-player1" class="player-in-bracket-game-win right-players"></player-in-bracket>-->
<!--                <player-in-bracket name="Ceci est un test3" score="8" id="right-two-player2" class="player-in-bracket-basic right-players"></player-in-bracket>-->
<!--            </div>-->
		`;
    }
}

export default bracket;
