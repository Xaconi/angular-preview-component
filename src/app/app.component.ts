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
  public componentPropsUnion: Array<{ key: string, values: Array<string> }> = [];
  public componentPropsObject: Array<string> = [];

/* @APComponentPropsTypes */ public componentPropsTypes;
/* @APComponentProps */ public componentProps;

  ngOnInit() {
    Object.keys(this.componentProps).forEach(key => {
      if(this.hasType(['string', 'String'], this.componentProps[key])) this.componentPropsString.push(key);
      else if(this.hasType(['boolean', 'Boolean'], this.componentProps[key])) this.componentPropsBoolean.push(key);
      else if(this.hasType(['number', 'Number'], this.componentProps[key])) this.componentPropsNumber.push(key);
      else if(this.hasUnionTypes(key)) this.componentPropsUnion.push({ key, values: this.getUnionTypes(key)});
      else if(this.hasType(['object'], this.componentProps[key])) this.componentPropsObject.push(key);
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

  public changePropUnion(value: any, componentUnionKey: string): void {
    this.componentProps[componentUnionKey] = value;
  }

  public changePropObject(event: any, componentObjectKey: string): void {
    this.componentProps[componentObjectKey] = JSON.parse(event.target.value);
  }

  public hasType(types: Array<string>, value: any): boolean {
    return types.indexOf(typeof value) != -1;
  }

  public hasUnionTypes(componentUnionKey: string): boolean {
    const componentUnionType = this.componentPropsTypes.find(componentPropsTypesItem => componentPropsTypesItem.key === componentUnionKey)!.type;
    return componentUnionType.indexOf('|') !== -1;
  }

  public getUnionTypes(componentUnionKey: string): Array<string> {
    const componentUnionType = this.componentPropsTypes.find(componentPropsTypesItem => componentPropsTypesItem.key === componentUnionKey)!.type;
    return componentUnionType.split(" | ");
  }
}
