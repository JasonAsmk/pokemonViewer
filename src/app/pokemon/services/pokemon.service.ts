import { Injectable } from '@angular/core';
import { concatMap, map, ReplaySubject, take, tap, toArray } from 'rxjs';
import { PokemonApiService } from './pokemon-api.service';
import { LogFactory } from '../../logging/log-factory.service';
import { Logger } from '../../logging/logger';
import { IPokemonServerModel } from '../models/pokemon.server.model';

export const POKE_FETCH_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class PokemonService {
  public get pokemons$() {
    return this._pokemons$.asObservable();
  }

  private _pokemons$: ReplaySubject<IPokemonServerModel[]> = new ReplaySubject(
    1,
  );
  private _waitingNextSet = false;
  private _offset = 0;
  private _logger: Logger;

  constructor(
    private readonly _pokemonApiService: PokemonApiService,
    logger: LogFactory,
  ) {
    this._logger = logger.getLogger('PokemonService');

    this._logger.debug('Will fetch and initialize pokemon list');
    this._pokemons$.next([]);
    this.getNextPokemonSet();
  }

  public getNextPokemonSet() {
    if (this._waitingNextSet) return;
    this._waitingNextSet = true;
    this._pokemonApiService
      .getPokemonList(POKE_FETCH_SIZE, this._offset)
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
          );
        }),
        tap((ls) => this._logger.debug(`Total ${ls.length} pokemon`)),
      )
      .subscribe({
        next: (ls) => {
          this._pokemons$.next(ls);
          this._offset += POKE_FETCH_SIZE;
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
