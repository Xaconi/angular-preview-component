import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  public componentPropsString: Array<string> = [];
  public componentPropsBoolean: Array<string> = [];
  public componentPropsNumber: Array<string> = [];

/* @APComponentProps */ public componentProps;

  ngOnInit() {
    Object.keys(this.componentProps).forEach(key => {
      if(this.hasType(['string', 'String'], this.componentProps[key])) this.componentPropsString.push(key);
      if(this.hasType(['boolean', 'Boolean'], this.componentProps[key])) this.componentPropsBoolean.push(key);
      if(this.hasType(['number', 'Number'], this.componentProps[key])) this.componentPropsNumber.push(key);
    })
  }

  public changePropString(text: string, componentStringKey: string): void {
    this.componentProps[componentStringKey] = text;
  }

  public changePropBoolean(value: string, componentBooleanKey: string): void {
    const booleanValue: boolean = value === 'true';
    this.componentProps[componentBooleanKey] = booleanValue;
  }

  public changePropNumber(value: number, componentNumberKey: string): void {
    this.componentProps[componentNumberKey] = value;
  }

  public hasType(types: Array<string>, value: any): boolean {
    return types.indexOf(typeof value) != -1;
  }
}
