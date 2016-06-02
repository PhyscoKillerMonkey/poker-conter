// Global variables
let players: Player[] = [];
let startMoney = 100;
let bigBlind = 2;
let round = 0;
let phase = 0;
let potTotal = 0;
let potPerPlayer = 0;
let nextPlayer = 0;
let playersReady = 0;
let curPlayers = players;

// DOM elements
let page = {
    playerName: document.getElementById("curPlayerName"),
    potTotal: document.getElementById("potTotal"),
    playerPot: document.getElementById("potPerPlayer")
}

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
        this.inCurrentPot = 0;
    }
    
    pay(amount: number) {
        this.money -= amount;
        this.inCurrentPot += amount;
        potTotal += amount;
    }
    
    choose() {
        console.log(this.name + " choose check, raise or fold");
    }
}

function check() {
    console.log("Player checked");
    
    let p = players[nextPlayer];
    p.pay(potPerPlayer - p.inCurrentPot);
    
    playersReady++;
    nextPlayer++;
    if (nextPlayer >= curPlayers.length) {nextPlayer = 0}
    doStuff();
}

function raise() {
    console.log("Player raised");
    
    let p = players[nextPlayer];
    potPerPlayer++;
    p.pay(potPerPlayer - p.inCurrentPot);
    
    playersReady = 1;
    nextPlayer++;
    if (nextPlayer >= curPlayers.length) {nextPlayer = 0}
    doStuff();
}

function fold() {
    console.log("Player folded");
    curPlayers.splice(nextPlayer);
    doStuff();
}

function newRound() {
    // We are in the next round
    round++;
    
    // Reset variables
    phase = 0;
    nextPlayer = 0;
    playersReady = 0;
    curPlayers = players;
    
    // Make players pay big-blind and little-blind
    let firstPlayer = round % players.length-1;
    players[firstPlayer].pay(bigBlind / 2);
    players[firstPlayer + 1].pay(bigBlind);
    potPerPlayer = bigBlind;
    
    doStuff();
}

function doStuff() {
    console.log("Phase " + phase);
    if (playersReady < curPlayers.length) {
        page.playerName.innerHTML = players[nextPlayer].name;
        page.potTotal.innerHTML = "Pot: " + potTotal.toString();
        page.playerPot.innerHTML = "Per Player: " + potPerPlayer.toString();
        console.log("Player " + nextPlayer + "'s turn.")
    } else {
        // We are going into the next phase
        nextPlayer = 0;
        playersReady = 0;
        phase++;
        if (phase == 4) {
            // Game finished!
        } else if (phase < 4) {
            doStuff();
        }
    }
}

window.onload = function() {
    console.log("Hello world!");
    players.push(new Player("Reece", startMoney));
    players.push(new Player("Laura", startMoney));
    newRound();
}