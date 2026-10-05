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
}