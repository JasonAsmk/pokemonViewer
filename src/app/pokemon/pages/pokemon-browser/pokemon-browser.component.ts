import { Component, OnInit } from '@angular/core';
import { PokemonViewCard } from '../../components/pokemon-view-card/pokemon-view-card.component';
import { PokemonService } from '../../services/pokemon.service';
import { IPokemonServerModel } from '../../models/pokemon.server.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'pokemon-browser',
  imports: [PokemonViewCard, AsyncPipe],
  templateUrl: './pokemon-browser.component.html',
  styleUrl: './pokemon-browser.component.scss',
})
export class PokemonBrowserPageComponent implements OnInit {
  public pokemon$ = new Subject<IPokemonServerModel[]>();
  constructor(private _pokemonService: PokemonService) {}

  public ngOnInit(): void {
    this._pokemonService.pokemons$
      .pipe(untilDestroyed(this))
      .subscribe((newSet) => this.pokemon$.next(newSet));
  }
}
