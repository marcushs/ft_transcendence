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

        console.log(bracketObj.quarterFinal)
        return `
            ${this.generateBracketSide(leftBracket,  'left','left-matches')}
            ${this.generateBracketSide(rightBracket, 'right', 'right-matches')}
            ${this.generateFinal(bracketObj.final)}
        `;
    }


    generateFinal(finalObj) {
        const playerLeft = finalObj[0][1];
        const playerRight = finalObj[0][0];

        console.log("player 1 ========= >>>> ", playerLeft)
        console.log("player 2 ========= >>>> ", playerRight)
        return `
            <div class="final-matches">
            <player-in-bracket name="${(playerLeft && playerLeft.name) ? playerLeft.name : ". . ."}" 
                    score="${(playerLeft && playerLeft.score) ? playerLeft.score : "-"}" 
                    id="final-player1" 
                    class="${(playerLeft && playerLeft.isWinner === true) ? 'player-in-bracket-tournament-win' :  'player-in-bracket-basic'}"></player-in-bracket>
            <player-in-bracket name="${(playerRight && playerRight.name) ? playerRight.name : ". . ."}" 
                    score="${(playerRight && playerRight.score) ? playerRight.score : "-"}" 
                    id="final-player2" 
                    class="${(playerRight && playerRight.isWinner === true) ? 'player-in-bracket-tournament-win' :  'player-in-bracket-basic'}"></player-in-bracket>
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
                    matchesRes += this.createPlayer(player,`${idPrefix}${index}`, (player.isWinner === true) ? `player-in-bracket-game-win` :  `player-in-bracket-basic`);
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
        setTimeout(() => {
            let name = "bracket_model-4.svg";

            if (this.nbOfPlayers === 8)
                name = "bracket_model-8.svg"
            if (this.nbOfPlayers === 16)
                name = "bracket_model-16.svg"
            document.querySelector('.left-matches').style.backgroundImage = `url("../../../../../../assets/${name}")`;
            document.querySelector('.right-matches').style.backgroundImage = `url("../../../../../../assets/${name}")`;
        }, 0);

        return `
            ${this.generateBracket(this.bracketObj)}
		`;
    }
}

export default Bracket;
