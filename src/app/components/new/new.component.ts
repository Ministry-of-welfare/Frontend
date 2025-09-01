import { Component } from '@angular/core';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [],
  templateUrl: './new.component.html',
  styleUrl: './new.component.css'
})
export class NewComponent {

  stam: string[][] = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
  tor: string = "❌";
  winnerMessage: string = "";
  flag: boolean = false;

  turn(ii: number, jj: number) {
    this.flag = false;
    if (this.tor == "❌") {
      this.stam[ii][jj] = "❌";
      this.tor = "⭕";
    } else if (this.tor == "⭕") {
      this.stam[ii][jj] = "⭕";
      this.tor = "❌";
    }

    this.checking();
  }

  checking() {
    // בדיקות עבור שורות ועמודות
    for (let i = 0; i < 3; i++) {
      if (this.stam[0][i] == "❌" && this.stam[1][i] == "❌" && this.stam[2][i] == "❌") {
        this.flag = true; // עמודה ל-X
        this.winnerMessage = "שחקן ❌ ניצח!!!!!!";
        this.resetGame();
      } else if (this.stam[0][i] == "⭕" && this.stam[1][i] == "⭕" && this.stam[2][i] == "⭕") {
        this.flag = true;
        this.winnerMessage = "שחקן ⭕ ניצח!!!!!!";
        this.resetGame();
      }
    }

    for (let j = 0; j < 3; j++) {
      if (this.stam[j][0] == "❌" && this.stam[j][1] == "❌" && this.stam[j][2] == "❌") {
        this.flag = true; // עמודה ל-X
        this.winnerMessage = "שחקן ❌ ניצח!!!!!!";
        this.resetGame();
      } else if (this.stam[j][0] == "⭕" && this.stam[j][1] == "⭕" && this.stam[j][2] == "⭕") {
        this.flag = true;
        this.winnerMessage = "שחקן ⭕ ניצח!!!!!!";
        this.resetGame();
      }
    }

    // בדיקות עבור אלכסונים
    if (this.stam[0][0] == "❌" && this.stam[1][1] == "❌" && this.stam[2][2] == "❌") {
      this.flag = true; // אלכסון ל-X
      this.winnerMessage = "שחקן ❌ ניצח!!!!!!";
      this.resetGame();
    } else if (this.stam[0][0] == "⭕" && this.stam[1][1] == "⭕" && this.stam[2][2] == "⭕") {
      this.flag = true; // אלכסון ל-O
      this.winnerMessage = "שחקן ⭕ ניצח!!!!!!";
      this.resetGame();
    } else if (this.stam[0][2] == "❌" && this.stam[1][1] == "❌" && this.stam[2][0] == "❌") {
      this.flag = true; // אלכסון שני ל-X
      this.winnerMessage = "שחקן ❌ ניצח!!!!!!";
      this.resetGame();
    } else if (this.stam[0][2] == "⭕" && this.stam[1][1] == "⭕" && this.stam[2][0] == "⭕") {
      this.flag = true; // אלכסון שני ל-O
      this.winnerMessage = "שחקן ⭕ ניצח!!!!!!";
      this.resetGame();
    }

    // בדיקה אם הלוח מלא
    if (!this.flag && this.stam.flat().every(cell => cell !== " ")) {
      this.winnerMessage = "משחק תיקו!";
      this.resetGame();
    }
  }

  resetGame() {
    setTimeout(() => {
      this.winnerMessage = ""; // מחק את הודעת הניצחון אחרי שנייה
    }, 1000);
    this.stam = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
  }
}
