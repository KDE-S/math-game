import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, debounceTime, filter, scan } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CheckEqualityValidator } from './check-equality.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('chooseGameLevelBtn') chooseGameLevelBtn!: ElementRef;

  destryRef = inject(DestroyRef);
  startGameSub: Subscription | null = null;
  correctAnswerCount: number = 0;
  secondsPerAnswer = 0;
  gameStarted: boolean = false;

  gameLevels = [
    {
      levelName: "Easy",
      levelValue: 10
    },
    {
      levelName: "medium",
      levelValue: 100
    },
    {
      levelName: "hard",
      levelValue: 1000
    }
  ];
  selectedGameValue = 10;

  gameForm: FormGroup = new FormGroup({});
  chooseGameLevelForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.initializeGameForm();
    this.initializeChooseGameLevelForm();
  }
  
  ngAfterViewInit(): void {
    this.chooseGameLevelBtn.nativeElement.click();
  }

  initializeGameForm() {
    this.gameForm = new FormGroup({
      a: new FormControl(this.generateRandomNum()),
      b: new FormControl(this.generateRandomNum()),
      answer: new FormControl(null),
    }, [CheckEqualityValidator.checkEquality("a", "b", "answer")]);
  }

  initializeChooseGameLevelForm() {
    this.chooseGameLevelForm = new FormGroup({
      level: new FormControl(10, [Validators.required])
    })
  }

  get a() {
    return this.gameForm.get("a")?.value;
  }

  get b() {
    return this.gameForm.get("b")?.value;
  }

  generateRandomNum() {
    return Math.floor(Math.random() * this.selectedGameValue);
  }

  checkInputValidation() {
    return this.gameForm.invalid && this.gameForm.dirty
  }

  chooseGameLevel(event: Event) {
    if (!this.chooseGameLevelForm.valid) {
      event.preventDefault();
      return;
    }
    this.selectedGameValue = this.chooseGameLevelForm.value.level;
    this.resetForm();
  }

  resetForm() {
    this.gameForm.reset({ a: this.generateRandomNum(), b: this.generateRandomNum() });
  }

  startGame() {
    if(!this.gameStarted)
    this.gameStarted = true;
    this.startGameSub = this.gameForm.statusChanges.pipe(
      debounceTime(1000),
      filter(res => res === "VALID"),
      scan(
        (acc) => {
          let result = {
            startTime: acc.startTime,
            correctAnswerCount: ++acc.correctAnswerCount
          };
          return result;
        },
        {
          startTime: new Date().getTime(),
          correctAnswerCount: 0
        }
      ),
      takeUntilDestroyed(this.destryRef)
    ).subscribe(
      {
        next: (res) => {
          this.correctAnswerCount = res.correctAnswerCount;
          this.secondsPerAnswer = (new Date().getTime() - res.startTime) / this.correctAnswerCount / 1000;
          this.gameForm.reset({
            a: this.generateRandomNum(),
            b: this.generateRandomNum(),
            answer: null
          })
        }
      }
    )
  }

  resetGame() {
    this.gameStarted = false;
    this.startGameSub?.unsubscribe();
    this.correctAnswerCount = 0;
    this.secondsPerAnswer = 0;
    this.resetForm();
  }

}
