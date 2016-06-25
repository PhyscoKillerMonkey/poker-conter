export class Player {
  name: string;
  id: string;
  money: number;
  inCurrentPot: number;
  folded: boolean;
  played: boolean;

  constructor(name: string, id: string, money: number) {
    this.name = name;
    this.id = id;
    this.money = money;
    this.inCurrentPot = 0;
    this.folded = false;
    this.played = false;
  }

  pay(amount: number) {
    this.money -= amount;
    this.inCurrentPot += amount;
    // potTotal += amount;
  }

  ready(potPP: number): boolean {
    if (this.folded || (this.played && this.inCurrentPot == potPP)) {
      return true
    } else if (this.inCurrentPot > potPP) {
      console.error("Player " + this.name + " has more money in pot than total...");
    } else {
      return false;
    }
  } 
}

export class PokerManager {
  startingMoney: number;
  private bigBlind: number;
  players: Player[] = [];
  currentPlayer = -1;
  dealer = -1;
  potTotal = 0;
  potPP = 0;
  round = 0;
  private phase = 0;
  private room;

  constructor(room, startingMoney?: number, bigBlind?: number) {
    this.room = room;
    this.startingMoney = startingMoney || 500;
    this.bigBlind = bigBlind || 10;
  }

  private nextPlayer() {
    this.currentPlayer++;
    if (this.currentPlayer >= this.players.length) {
      this.currentPlayer = 0;
    }
    if (this.players[this.currentPlayer].folded) {
      this.nextPlayer();
    }
  }

  private allReady(): boolean {
    for (let p of this.players) {
      if (!p.ready(this.potPP)) {
        return false;
      }
    }
    return true;
  }

  private numFolded(): number {
    let f = 0;
    for (let p of this.players) {
      if (p.folded) {
        f++;
      }
    }
    return f;
  }

  raise(amount: number) {
    this.potPP += amount;
    console.log(this.potPP);
    let p = this.players[this.currentPlayer];
    p.pay(this.potPP - p.inCurrentPot);
    p.played = true;
    this.nextPlayer();
    this.doTurn();
  }

  fold() {
    this.players[this.currentPlayer].folded = true;
    this.nextPlayer();
    this.doTurn();
  }

  newRound() {
    this.round++;
    this.phase = 0;
    this.potTotal = 0;
    this.potPP = this.bigBlind;

    for (let p of this.players) {
      p.folded = false;
      p.inCurrentPot = 0;
      p.played = false;
    }

    // Make the dealer one more, then the player one more than him
    this.currentPlayer = this.dealer;
    this.nextPlayer();
    this.dealer = this.currentPlayer;
    console.log(this.players[this.dealer].name + " is dealer");
    this.nextPlayer();
    console.log(this.players[this.currentPlayer].name + " is SB");
    this.players[this.currentPlayer].pay(this.bigBlind/2);
    this.nextPlayer();
    console.log(this.players[this.currentPlayer].name + " is BB");
    this.players[this.currentPlayer].pay(this.bigBlind);
    this.nextPlayer();
    console.log(this.players[this.currentPlayer].name + " is UTG");

    this.doTurn();
  }

  private doTurn() {
    if (this.numFolded() == this.players.length - 1) {
      console.log("Only one player left");
      // Find the remaining player and make them the winner
      for (let p of this.players) {
        if (!p.folded) {
          this.winnerIs(p);
        }
      }
    } else if (this.phase == 4) {
      console.log("The game has ended, " + this.players[0].name + " is choosing a winner");
      this.room.updateClients();
      this.room.clientMessage(this.players[0], "chooseWinner");
    } else if (this.allReady()) {
      // Go into the next phase
      this.phase++;
      console.log("Everybody is ready, going into phase " + this.phase);
      this.currentPlayer = this.dealer;

      for (let p of this.players) {
        p.played = false;
      }
      this.doTurn();
    } else {
      this.room.updateClients();
      console.log("Player " + this.players[this.currentPlayer].name + " has to choose");
      this.room.clientMessage(this.players[this.currentPlayer], "choose");
    }
  }

  private winnerIs(player: Player) {
    console.log("Winner is " + player.name);
    player.money += this.potTotal;
    this.newRound();
  }
}