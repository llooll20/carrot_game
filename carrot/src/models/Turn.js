//턴 진행을 나타내는 클래스
export class Turn {
    /** @type {number} */
    CurrentTurn;

    constructor() {
        this.CurrentTurn = 0;
    }

    NextTurn() {
        this.CurrentTurn++;
    }
    GetMonth() {
        return Math.floor((this.CurrentTurn - 1) / 4) % 12 + 1;
    }

    GetYear() {
        return Math.floor((this.CurrentTurn - 1) / 48) + 1;
    }

    IsMonthEnd() {
        return this.CurrentTurn % 4 === 0;
    }

    IsYearEnd() {
        return this.CurrentTurn % 48 === 0;
    }
}