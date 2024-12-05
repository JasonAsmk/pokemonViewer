import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IPokemonQueryResultLocalModel,
  IPokemonQueryResultServerModel,
} from '../models/pokemon-query-result.server.model';
import { IPokemonServerModel } from '../models/pokemon.server.model';
import { LogFactory } from '../../logging/log-factory.service';
import { Logger } from '../../logging/logger';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private _logger: Logger;
  constructor(
    private readonly _http: HttpClient,
    loggerFactory: LogFactory,
  ) {
    this._logger = loggerFactory.getLogger('PokemonApi');
  }

  public getPokemonList(
    limit = 50,
    offset = 0,
  ): Observable<IPokemonQueryResultLocalModel[]> {
    return this._http
      .get<{
        results: IPokemonQueryResultServerModel[];
      }>(
        environment.pokeApiBaseUrl +
          'pokemon?' +
          `&limit=${limit}` +
          (offset ? `&offset=${offset}` : ''),
      )
      .pipe(
        map((results) =>
          results?.results.map((r) => ({
            name: r.name,
            id: this.extractIDFromUrl(r.url),
          })),
        ),
        catchError((error) => {
          this._logger.error(`Could not fetch pokemon list: ${error}`);
          return throwError(() => error);
        }),
      );
  }

  public getSinglePokemon(
    pokemonId: string,
  ): Observable<IPokemonServerModel | null> {
    return this._http
      .get<IPokemonServerModel>(
        environment.pokeApiBaseUrl + 'pokemon' + `/${pokemonId}`,
      )
      .pipe(
        map((result) => ({
          name: result.name,
          weight: result.weight,
          sprites: result.sprites,
        })),
        catchError((error) => {
          this._logger.error(
            `Could not fetch pokemon with id ${pokemonId} : ${error}`,
          );
          return of(null);
        }),
      );
  }

  /**
   * Pokemon URLs have this format https://pokeapi.co/api/v2/pokemon/5/
   * so we just need the last number which the ID
   */
  private extractIDFromUrl(url: string) {
    const splitted = url.split('/');
    return splitted[splitted.length - 2];
  }
}
