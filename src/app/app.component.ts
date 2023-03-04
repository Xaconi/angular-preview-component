import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'VSCode Webview Angular';

/* @APComponentProps */ public componentProps

  public changeText(text: string): void {
    this.componentProps.text = text;
    alert(text);
  }
}
