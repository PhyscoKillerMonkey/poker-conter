/// <reference path="../../typings/index.d.ts" />

let startingMoney = 100,
  bigBlind = 4;

let players: Player[] = [],
  currentPlayer = 0,
  dealer = 0,
  potTotal = 0,
  potPP = 0,
  round = 0,
  phase = 0;

class Player {
  name: string;
  money: number;
  inCurrentPot: number;
  folded: boolean;

  constructor(name: string, money: number) {
    this.name = name;
    this.money = money;
    this.inCurrentPot = 0;
    this.folded = false;
  }

  pay(amount: number) {
    this.money -= amount;
    this.inCurrentPot += amount;
    potTotal += amount;
  }

  ready(): boolean {
    if (this.inCurrentPot == potPP) {
      return true
    } else if (this.inCurrentPot > potPP) {
      console.error("Player " + name + " has more money in pot than total...");
    }
    return false;
  } 
}

function nextPlayer() {
  currentPlayer++;
  if (currentPlayer >= players.length) {
    currentPlayer = 0;
  }
  if (players[currentPlayer].folded) {
    nextPlayer();
  }
}

function allReady(): boolean {
  for (let p of players) {
    if (!p.ready) {
      return false;
    }
  }
  return true;
}

function folded(): number {
  let f = 0;
  for (let p of players) {
    if (p.folded) {
      f++;
    }
  }
  return f;
}

function newRound() {
  round++;
  phase = 0;
  potTotal = 0;
  potPP = 0;

  for (let p of players) {
    p.folded = false;
    p.inCurrentPot = 0;
  }

  // Make the dealer one more, then the player one more than him
  currentPlayer = dealer;
  nextPlayer();
  dealer = currentPlayer;
  nextPlayer();
  players[currentPlayer].pay(bigBlind/2);
  nextPlayer();
  players[currentPlayer].pay(bigBlind);
  nextPlayer();

  doTurn();
}

function doTurn() {
  if (folded() == players.length - 1) {
    console.log("Only one player left");
  } else if (phase == 4) {
    console.log("The game has ended, choose a winner");
  } else if (allReady()) {
    // Go into the next phase
    phase++;
    currentPlayer = -1;
    nextPlayer();
    doTurn();
  } else {
    nextPlayer();
    console.log("Player " + players[currentPlayer].name + " has to choose");
  }
}