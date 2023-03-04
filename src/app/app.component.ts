import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  public componentPropsString: Array<string> = [];

/* @APComponentProps */ public componentProps;

  ngOnInit() {
    Object.keys(this.componentProps).forEach(key => {
      if(typeof this.componentProps[key] === 'string') this.componentPropsString.push(key);
    })
  }

  public changePropString(text: string, componentStringKey: string): void {
    this.componentProps[componentStringKey] = text;
  }
}
