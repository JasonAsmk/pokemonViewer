import { Injectable } from '@angular/core';
import { concatMap, map, ReplaySubject, take, tap, toArray } from 'rxjs';
import { PokemonApiService } from './pokemon-api.service';
import { LogFactory } from '../../logging/log-factory.service';
import { Logger } from '../../logging/logger';
import { IPokemonServerModel } from '../models/pokemon.server.model';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  public get pokemons$() {
    return this._pokemons$.asObservable();
  }

  private _pokemons$: ReplaySubject<IPokemonServerModel[]> = new ReplaySubject(
    1,
  );
  private _waitingNextSet = false;
  private _logger: Logger;

  constructor(
    private readonly _pokemonApiService: PokemonApiService,
    logger: LogFactory,
  ) {
    this._logger = logger.getLogger('PokemonService');

    this._logger.debug('Will fetch and initialize pokemon list');
    this._pokemons$.next([]);
    this.getNextPokemonSet(0);
  }

  public getNextPokemonSet(offset: number) {
    if (this._waitingNextSet) return;
    this._waitingNextSet = true;
    this._pokemonApiService
      .getPokemonList(1, offset)
      .pipe(
        tap((ls) => this._logger.debug(`Fetched another ${ls.length} pokemon`)),
        concatMap((pokemonList) => pokemonList),
        concatMap((pokemon) =>
          this._pokemonApiService.getSinglePokemon(pokemon.id),
        ),
        toArray(),
        concatMap((v) => {
          const newPokemonList = v.filter((x) => !!x);
          return this.pokemons$.pipe(
            take(1),
            map((oldPokemonList) => oldPokemonList.concat(newPokemonList)),
          ); // in reality due to network these can come not in order but I consider this out of scope
        }),
        tap((ls) => this._logger.debug(`Total ${ls.length} pokemon`)),
      )
      .subscribe({
        next: (ls) => {
          this._pokemons$.next(ls);
          this._waitingNextSet = false;
        },
        error: (err) => {
          // release resource
          this._logger.error(err);
          this._waitingNextSet = false;
        },
      });
  }
}
