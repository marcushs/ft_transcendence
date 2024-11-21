export default class BracketObj {
    #tournamentBracket;
    #stageMapping;
    #bracketObj;

    constructor(tournamentBracket, tournamentSize) {
        this.#tournamentBracket = tournamentBracket;
        this.#bracketObj = {
            nbOfPlayers: tournamentSize,
            eighthFinal: {},
            quarterFinal: {},
            semiFinal: {},
            final: [],
        };
        this.#stageMapping = {
            'eighth_finals': {target: this.#bracketObj.eighthFinal, length: 4},
            'quarter_finals': {target: this.#bracketObj.quarterFinal, length: 2},
            'semi_finals': {target: this.#bracketObj.semiFinal, length: 1},
            'finals': {target: this.#bracketObj.final},
        };
        this.#makeBracketObject();
    }

    // Static factory method
    static create(tournamentBracket, tournamentSize) {
        const instance = new BracketObj(tournamentBracket, tournamentSize);
        return instance.getBracketObj();
    }

    // Getter for bracketObj
    getBracketObj() {
        return this.#bracketObj;
    }

	#makeBracketObject() {
		const eighthFinalsMatches = this.#tournamentBracket.eighth_finals;
		const quarterFinalsMatches = this.#tournamentBracket.quarter_finals;
		const semiFinalsMatches = this.#tournamentBracket.semi_finals;
		const finalsMatches = this.#tournamentBracket.finals;

		(eighthFinalsMatches.length === 0) ? this.fillNullMatches('eighth_finals') : this.fillBracketMatches('eighth_finals',eighthFinalsMatches);
		(quarterFinalsMatches.length === 0) ? this.fillNullMatches('quarter_finals') : this.fillBracketMatches('quarter_finals', quarterFinalsMatches);
		(semiFinalsMatches.length === 0) ? this.fillNullMatches('semi_finals') : this.fillBracketMatches('semi_finals', semiFinalsMatches);
		(finalsMatches.length === 0) ? this.fillNullMatches('finals') : this.fillBracketMatches('finals', finalsMatches);
	}

	fillBracketMatches(stage, stageMatches) {
		let target = this.#stageMapping[stage].target;
	
		if (stage === 'finals') {
			console.log(stageMatches[0])
			console.log('target is', target)
			let finalMatch = this.makeMatch(stageMatches[0], 'left');
			target.push(finalMatch)
			// target.push(this.makeMatch(stageMatches[0]));
			return ;
		}

		target['leftMatches'] = [];
		target['rightMatches'] = [];

		stageMatches.forEach((match, idx) => {
			console.log('BracketObj: ', match.bracket_index);
			(match.bracket_index < stageMatches.length / 2) ? 
			target.leftMatches.push(this.makeMatch(match, 'left')) :
			target.rightMatches.push(this.makeMatch(match, 'right'));
		});
	}

	fillNullMatches(stage) {
		let target = this.#stageMapping[stage].target;
		const length = this.#stageMapping[stage].length;

		if (stage === 'finals') {
			target.push(this.nullMatch());
			return ;
		}
		target['leftMatches'] = Array.from({ length: length }, () => this.nullMatch());
		target['rightMatches'] = Array.from({ length: length }, () => this.nullMatch());
	}

	nullMatch() {
		return [null, null];
	}

	makeMatch(match, side) {
		console.log('called make match')
		let match_pair = new Array(2);

		if (side === 'left') {
			console.log('match is ', match)
			if (!match.winner && !match.loser) {
				if (match.players.length < 1) return [null, null];

				if (match.players.length === 1) {
					if (match.players[0].player_number === 0) {
						match_pair[0] = {name: match.players[0].alias, score: '0'};
						match_pair[1] = null;
					} else {
						match_pair[0] = {name: match.players[0].alias, score: '0'};
						match_pair[1] = null;
					}
					return match_pair;
				}

				if (match.players[0].player_number === 0) {
					match_pair[0] = {name: match.players[0].alias, score: '0'};
					match_pair[1] = {name: match.players[1].alias, score: '0'};
				} else {
					match_pair[0] = {name: match.players[1].alias, score: '0'};
					match_pair[1] = {name: match.players[0].alias, score: '0'};
				}
				return match_pair;
			}

			if (match.players[0].player_number === 0) {
				console.error('----------------->', match.players[1].id, match.winner.id)
				match_pair[0] = {name: match.players[0].alias, score: `${match.players[0].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[0].id === match.winner.id) ? true : false};
				match_pair[1] = {name: match.players[1].alias, score: `${match.players[1].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[1].id === match.winner.id) ? true : false};
			} else {
				match_pair[0] = {name: match.players[1].alias, score: `${match.players[1].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[1].id === match.winner.id) ? true : false};
				match_pair[1] = {name: match.players[0].alias, score: `${match.players[0].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[0].id === match.winner.id) ? true : false};
			}
			return match_pair;
		}

		if (!match.winner && !match.loser) {
			if (match.players.length < 1) return [null, null];

			if (match.players.length === 1) {
				if (match.players[0].player_number === 0) {
					match_pair[1] = {name: match.players[0].alias, score: '0'};
					match_pair[0] = null;
				} else {
					match_pair[1] = {name: match.players[0].alias, score: '0'};
					match_pair[0] = null;
				}
				return match_pair;
			}

			if (match.players[0].player_number === 0) {
				match_pair[1] = {name: match.players[0].alias, score: '0'};
				match_pair[0] = {name: match.players[1].alias, score: '0'};
			} else {
				match_pair[1] = {name: match.players[1].alias, score: '0'};
				match_pair[0] = {name: match.players[0].alias, score: '0'};
			}
			return match_pair;
		}

		if (match.players[0].player_number === 0) {
			match_pair[1] = {name: match.players[0].alias, score: `${match.players[0].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[0].id === match.winner.id) ? true : false};
			match_pair[0] = {name: match.players[1].alias, score: `${match.players[1].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[1].id === match.winner.id) ? true : false};
		} else {
			match_pair[1] = {name: match.players[1].alias, score: `${match.players[1].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[1].id === match.winner.id) ? true : false};
			match_pair[0] = {name: match.players[0].alias, score: `${match.players[0].id === match.winner.id ? match.winner_score : match.loser_score}`, isWinner: (match.players[0].id === match.winner.id) ? true : false};
		}
		return match_pair;
	}
}
