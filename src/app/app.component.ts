import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TegelModule } from '@scania/tegel-angular-17';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TegelModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'github-insights-dashboard';
}
