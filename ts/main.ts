// Global variables
let players: Player[];
let startCash = 100;
let bigBlind = 2;
let potAmount = 0;

/**
 * Player
 */
class Player {
    
    name: string;
    cash: number;
    
    constructor(name: string, cash: number) {
        this.name = name;
        this.cash = cash;
    }
}

window.onload = function() {
    console.log("Hello world!");
}