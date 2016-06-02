// Global variables
let players: Player[] = [];
let startMoney = 100;
let bigBlind = 2;

/**
 * Player
 */
class Player {
    
    name: string;
    money: number;
    inCurrentPot: number;
    
    constructor(name: string, money: number) {
        this.name = name;
        this.money = money;
    }
    
    pay(amount: number) {
        this.money -= amount;
        this.inCurrentPot += amount;
    }
    
    choose() {
        console.log(this.name + " choose check, raise or fold");
    }
}

function play(round: number) {
    // Make players pay big-blind and little-blind
    let firstPlayer = round % players.length;
    players[firstPlayer].pay(bigBlind / 2);
    players[firstPlayer + 1].pay(bigBlind);
    
    // Phases are 0: hand cards, 1: flop, 2: turn, 3: river (finished)
    let phase = 0;
    let potTotal = 0;
    let potPerPlayer = 0;
    while (phase <= 3) {
        let nextPlayer = 0;
        let playersReady = 0;
        let curPlayers = players;
        while (playersReady < curPlayers.length) {
            curPlayers[nextPlayer].choose();
            playersReady++;
            nextPlayer++;
            if (nextPlayer >= curPlayers.length) { nextPlayer = 0 } 
        }
        phase++;
    }
}

window.onload = function() {
    console.log("Hello world!");
    players.push(new Player("Reece", startMoney));
    players.push(new Player("Laura", startMoney));
    play(0);
}