// Global variables
let players: Player[];
let startMoney = 100;
let bigBlind = 2;
let potAmount = 0;

/**
 * Player
 */
class Player {
    
    name: string;
    money: number;
    
    constructor(name: string, money: number) {
        this.name = name;
        this.money = money;
    }
}

function play(round: number) {
    
}

window.onload = function() {
    console.log("Hello world!");
}