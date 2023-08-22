import { DestroyRef, Directive, ElementRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgControl } from "@angular/forms";
import { map } from "rxjs";

@Directive({
  selector: '[appBgChange]'
})
export class BgChangeDirective implements OnInit {

  destroyRef = inject(DestroyRef);

  constructor(
    private elRef: ElementRef,
    private control: NgControl
  ) { }

  ngOnInit(): void {
    
    this.control.control?.parent?.valueChanges.pipe(
      map(({ a, b, answer }) => {
        return Math.abs((a + b - answer) / (a + b));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      {
        next : res => {        
          if(res > 0 && res < 0.2){
            this.elRef.nativeElement.classList.add("near-highlight");
          }else if( res == 0){
            this.elRef.nativeElement.classList.remove("near-highlight");
            this.elRef.nativeElement.classList.add("correct-highlight");
          }else{
            this.elRef.nativeElement.classList.remove("near-highlight");
            this.elRef.nativeElement.classList.remove("correct-highlight");
          }
        },
        error: (err) => {
          console.log(err);
        }
      }
    )
  }

}
