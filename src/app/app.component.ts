import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, filter, scan } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CheckEqualityValidator } from './check-equality.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  destryRef = inject(DestroyRef);
  gameForm: FormGroup = new FormGroup({});
  correctAnswerCount: number = 0;
  secondsPerAnswer = 0;

  ngOnInit(): void {
    this.initializeGameForm();

    this.gameForm.statusChanges.pipe(
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

  initializeGameForm() {
    this.gameForm = new FormGroup({
      a: new FormControl(this.generateRandomNum()),
      b: new FormControl(this.generateRandomNum()),
      answer: new FormControl(null),
    }, [CheckEqualityValidator.checkEquality("a", "b", "answer")]);
  }

  get a (){
    return this.gameForm.get("a")?.value;
  }

  get b (){
    return this.gameForm.get("b")?.value;
  }

  generateRandomNum() {
    return Math.floor(Math.random() * 10);
  }

  checkAnswerInputValidation() {
    return this.gameForm.invalid && this.gameForm.dirty
  }

  highlightAnswer(a: number, b: number, answer: number){
    if(Math.abs( (a+b - answer) / (a+b) ) < 0.2){
      return true
    }
    return false;
  }

  resetForm() {
    this.generateRandomNum();
    this.gameForm.reset({ a: this.generateRandomNum(), b: this.generateRandomNum() });
  }
  
}
