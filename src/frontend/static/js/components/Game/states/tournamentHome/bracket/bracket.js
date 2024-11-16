import './PlayerInBracketComponent.js'

class Bracket {

    constructor(bracketObj) {
        this.redirectState = "bracket";
        this.class = "bracket";
        this.bracketObj = bracketObj;
    }

    generateBracket(bracketObj) {
        let res = '';

        const leftBracket = {
            eighthFinal: bracketObj.eighthFinal.leftMatches,
            quarterFinal: bracketObj.quarterFinal.leftMatches,
            semiFinal: bracketObj.semiFinal.leftMatches,
        }
        const rightBracket = {
            eighthFinal: bracketObj.eighthFinal.rightMatches,
            quarterFinal: bracketObj.quarterFinal.rightMatches,
            semiFinal: bracketObj.semiFinal.rightMatches,
        }


        return `
            ${this.generateBracketSide(leftBracket,  'left','left-matches')}
            ${this.generateBracketSide(rightBracket, 'right', 'right-matches')}
            ${this.generateFinal(bracketObj.final)}
        `;
    }


    generateFinal(finalObj) {
        const playerLeft = finalObj[0][1];
        const playerRight = finalObj[0][0];
        console.log("---------> Final === ", finalObj);

        return `
            <div class="final-matches">
                ${(playerLeft) ?
                `<player-in-bracket name="${(playerLeft.name) ? playerLeft.name : ""}" 
                    score="${(playerLeft.score) ? playerLeft.score : ""}" 
                    id="final-player1" 
                    class="${(playerLeft.score === '10') ? 'player-in-bracket-tournament-win' :  'player-in-bracket-basic'}"></player-in-bracket>` :
            `<player-in-bracket name="" score="" id="final-player1" class="no-player-in-bracket"></player-in-bracket>`}
                ${(playerRight) ? 
                `<player-in-bracket name="${(playerRight.name) ? playerRight.name : ""}" 
                    score="${(playerRight.score) ? playerRight.score : ""}" 
                    id="final-player2" 
                    class="${(playerRight.score === '10') ? 'player-in-bracket-tournament-win' :  'player-in-bracket-basic'}"></player-in-bracket>` : 
                `<player-in-bracket name="" score="" id="final-player2" class="no-player-in-bracket"></player-in-bracket>`}
            </div>
        `;
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
                if (player)
                    matchesRes += this.createPlayer(player,`${idPrefix}${index}`, (player.score === '10') ? `player-in-bracket-game-win` :  `player-in-bracket-basic`);
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
            ${this.generateBracket(this.bracketObj)}
		`;
    }
}

export default Bracket;
