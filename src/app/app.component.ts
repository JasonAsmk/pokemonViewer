import { Component } from '@angular/core';
import { PokemonBrowserPageComponent } from './pokemon/pages/pokemon-browser/pokemon-browser.component';

@Component({
  selector: 'app-root',
  imports: [PokemonBrowserPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-test';
}
