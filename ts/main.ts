// Global variables
let startMoney = 100;
let bigBlind = 4;

// Game variables
let players: Player[] = [];
let round = 0;
let phase = 0;
let raiseAmount = 1;
let potTotal = 0;
let potPerPlayer = 0;
let currentPlayer = 0;
let playersReady = 0;
let playersFolded = 0;

// DOM elements
let page = {
  roundDisplay: document.getElementById("roundDisplay"),
  phaseDisplay: document.getElementById("phaseDisplay"),
  playerName: document.getElementById("nameDisplay"),
  potTotal: document.getElementById("potDisplay"),
  playerPot: document.getElementById("potPPDisplay"),
  checkButton: document.getElementById("checkButton"),
  betButton: document.getElementById("betButton"),
  leaderboard: document.getElementById("leaderboard"),
  winButtonsInner: document.getElementById("winButtonsInner")
}

/**
 * Player
 */
class Player {

  name: string;
  money: number;
  inCurrentPot: number;
  folded: boolean;

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
}

function updateDisplay() {
  page.roundDisplay.innerHTML = "Round: " + round;
  page.phaseDisplay.innerHTML = "Phase: " + phase;
  page.playerName.innerHTML = players[currentPlayer].name;
  page.potTotal.innerHTML = "Pot: £" + potTotal;
  page.playerPot.innerHTML = "Per Player: £" + potPerPlayer;
  page.betButton.innerHTML = "Raise £" + raiseAmount;

  let betDifference = potPerPlayer - players[currentPlayer].inCurrentPot;
  if (betDifference == 0) {
    page.checkButton.innerHTML = "Check";
  } else {
    page.checkButton.innerHTML = "Call £" + betDifference;
  }

  page.leaderboard.innerHTML = "";
  for (let p of players) {
    let line = document.createElement("p");
    if (p.folded) {
      line.innerHTML = "<s>" + p.name + " £" + p.money + "</s>";
    } else {
      line.innerHTML = p.name + " £" + p.money;
    }
    page.leaderboard.appendChild(line);
  }
}

function nextPlayer() {
  console.log("Player " + currentPlayer);
  currentPlayer++;
  console.log("Player " + currentPlayer);
  if (currentPlayer >= players.length) {
    currentPlayer = 0;
    console.log("Out of range, choosing player 0");
  }
  if (players[currentPlayer].folded) {
    console.log("Player is folded, choosing next");
    nextPlayer();
  }
}

function check() {
  console.log("Player checked");

  let p = players[currentPlayer];
  p.pay(potPerPlayer - p.inCurrentPot);

  playersReady++;
  nextPlayer();
  doStuff();
}

function lowerRaise() {
  if (raiseAmount > 1) {
    raiseAmount--;
    updateDisplay();
  }
}

function increaseRaise() {
  raiseAmount++;
  updateDisplay();
}

function raise() {
  potPerPlayer += raiseAmount;

  let p = players[currentPlayer];
  p.pay(potPerPlayer - p.inCurrentPot);

  playersReady = 1;
  nextPlayer();
  doStuff();
}

function fold() {
  console.log("Player folded");
  players[currentPlayer].folded = true;
  nextPlayer();
  playersFolded++;
  doStuff();
}

function newRound() {
  // We are in the next round
  round++;

  // Reset variables
  phase = 0;
  playersReady = 1;
  playersFolded = 0;

  for (let p of players) {
    p.folded = false;
    p.inCurrentPot = 0;
  }

  // Make players pay big-blind and little-blind
  let firstPlayer = ((round-1) % players.length);
  console.log("First player is " + firstPlayer);
  players[firstPlayer].pay(bigBlind / 2);
  if (firstPlayer == players.length - 1) {
    players[0].pay(bigBlind);
  } else {
    players[firstPlayer + 1].pay(bigBlind);
  }
  potPerPlayer = bigBlind;

  // Start play from person to left of big-blind
  currentPlayer = firstPlayer + 2;
  if (currentPlayer == players.length + 1) {
    currentPlayer = 1;
  } else if (currentPlayer == players.length) {
    currentPlayer = 0;
  }

  doStuff();
}

function doStuff() {
  console.log("Doing stuff on phase " + phase);
  updateDisplay();
  console.log(playersReady + " " + (players.length - playersFolded));
  if (players.length - playersFolded == 1) {
    // There is only one player left in the game
    winner(players[currentPlayer]);
  } else if (playersReady < players.length - playersFolded) {
    raiseAmount = 1;
    console.log("Player " + currentPlayer + "'s turn.")
  } else {
    // We are going into the next phase
    currentPlayer = 0;
    playersReady = 0;
    raiseAmount = 1;
    phase++;
    if (phase == 4) {
      finishRound();
    } else if (phase < 4) {
      doStuff();
    }
  }
}

function finishRound() {
  console.log("Game is finished!");
  page.winButtonsInner.innerHTML = "";
  for (let p of players) {
    if (!p.folded) {
      let button = document.createElement("button");
      button.innerHTML = p.name;
      button.onclick = function () { winner(p); };
      page.winButtonsInner.appendChild(button);
    }
  }
}

function winner(player: Player) {
  player.money += potTotal;
  potTotal = 0;
  newRound();
  page.winButtonsInner.innerHTML = "";
}

window.onload = function () {
  console.log("Hello world!");
  players.push(new Player("Reece", startMoney));
  players.push(new Player("Laura", startMoney));
  newRound();
}