import './PlayerInBracketComponent.js'

class bracket {

    constructor() {
        this.redirectState = "bracket";
        this.class = "bracket";

        this.temporaryPlayersList = {
            eighthFinal: {
                leftMatches: [
                    [
                        // {name: 'WWWWWWWWWWWW', score: '9'},
                        {},
                        {name: 'Sowoo', score: '11'},
                    ],
                    [
                        {name: 'Marcus', score: '6'},
                        {name: 'Alex', score: '11'},
                    ],
                    [
                        {name: 'Theo', score: '1'},
                        {name: 'Hleung', score: '11'},
                    ],
                    [
                        {name: 'Shellks', score: '11'},
                        {name: 'AAAAAAAAAAAA', score: '4'},
                    ],
                ],
                rightMatches: [
                    [
                        {name: 'Pgouasmi', score: '11'},
                        {name: 'Jbadaire', score: '10'},
                    ],
                    [
                        {name: 'Chonorat', score: '8'},
                        {name: 'Mphilip', score: '11'},
                    ],
                    [
                        {name: 'Tgayet', score: '8'},
                        {name: 'Eguelin', score: '11'},
                    ],
                    [
                        {name: 'Natterie', score: '8'},
                        {name: 'Jcuzin', score: '11'},
                    ]
                ]
            },
            quarterFinal: {
                leftMatches: [
                    [
                        // {name: 'Sowoo', score: '9'},
                        {},
                        // {name: 'Alex', score: '11'},
                        {},
                    ],
                    [
                        // {name: 'Hleung', score: '11'},
                        {},
                        // {name: 'Shellks', score: '6'},
                        {},
                    ],
                ],
                rightMatches: [
                    [
                        {name: 'Pgouasmi', score: '11'},
                        {name: 'Mphilip', score: '10'},
                    ],
                    [
                        {name: 'Eguelin', score: '11'},
                        {name: 'Jcuzin', score: '8'},
                    ],
                ]
            },
            semiFinal: {
                leftMatches: [
                    [
                        {name: 'Alex', score: '9'},
                        {name: 'Hleung', score: '11'},
                    ],
                ],
                rightMatches: [
                    [
                        {name: 'Pgouasmi', score: '11'},
                        {name: 'Eguelin', score: '10'},
                    ],
                ]
            },
            final: [
                {name: 'Pgouasmi',score: '10'},
                {name: 'Hleung',score: '11'},
            ]
        }
    }

    generateBracket(bracketObj) {
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
            ${this.generateBracketSide(leftBracket,  'left','left-matches')}
            ${this.generateBracketSide(rightBracket, 'right', 'right-matches')}
            ${this.generateFinal(bracketObj.final)}
        `;
    }

    generateFinal(finalMatch) {
        const player1Class = (finalMatch[0].score === '11') ? 'player-in-bracket-tournament-win' : 'player-in-bracket-loose';
        const player2Class = (finalMatch[1].score === '11') ? 'player-in-bracket-tournament-win' : 'player-in-bracket-loose';

        return `
            <div class="final-matches">
                ${this.createPlayerElement(finalMatch[0], 'final-player1', player1Class)}
                ${this.createPlayerElement(finalMatch[1], 'final-player2', player2Class)}
            </div>
        `
    }

    generateBracketSide(bracket, side, className) {
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
                matchesRes += this.createPlayerElement(player,`${idPrefix}${index}`, (player.score === '11') ? `player-in-bracket-game-win` :  `player-in-bracket-loose`);
                index++;
            });
        }

        return matchesRes;
    }

    createPlayerElement(player, id, className) {
        if (Object.keys(player).length === 0) {
            return `
                <player-in-bracket name="TBD" score="-" id="${id}" class="player-in-bracket-tbd"></player-in-bracket>
               `;
        }
        return `
            <player-in-bracket name="${player.name}" score="${player.score}" id="${id}" class="${className}"></player-in-bracket>
        `;
    }

    render() {
        return `
            ${this.generateBracket(this.temporaryPlayersList)}
		`;
    }
}

export default bracket;