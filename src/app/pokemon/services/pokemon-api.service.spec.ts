import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PokemonApiService } from './pokemon-api.service';
import { LogFactory } from '../../logging/log-factory.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('PokemonApiService', () => {
  let service: PokemonApiService;
  let httpMock: HttpTestingController;
  let mockLoggerFactory: jasmine.SpyObj<LogFactory>;

  beforeEach(() => {
    mockLoggerFactory = jasmine.createSpyObj('LogFactory', ['getLogger']);
    mockLoggerFactory.getLogger.and.returnValue({
      error: jasmine.createSpy('error'),
    } as any);

    TestBed.configureTestingModule({
      providers: [
        PokemonApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LogFactory, useValue: mockLoggerFactory },
      ],
    });

    service = TestBed.inject(PokemonApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPokemonList', () => {
    it('should fetch the Pokemon list with default parameters', () => {
      const mockResponse = {
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      };

      service.getPokemonList().subscribe((pokemonList) => {
        expect(pokemonList.length).toBe(2);
        expect(pokemonList[0].name).toBe('bulbasaur');
        expect(pokemonList[0].id).toBe('1');
      });

      const req = httpMock.expectOne(
        `${environment.pokeApiBaseUrl}pokemon?&limit=50`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch the Pokemon list with given limit and offset', () => {
      const mockResponse = {
        results: [
          { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        ],
      };

      service.getPokemonList(10, 20).subscribe((pokemonList) => {
        expect(pokemonList.length).toBe(1);
        expect(pokemonList[0].name).toBe('charmander');
        expect(pokemonList[0].id).toBe('4');
      });

      const req = httpMock.expectOne(
        `${environment.pokeApiBaseUrl}pokemon?&limit=10&offset=20`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors when fetching the Pokemon list', () => {
      service.getPokemonList().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(
        `${environment.pokeApiBaseUrl}pokemon?&limit=50`,
      );
      expect(req.request.method).toBe('GET');
      req.flush('Error occurred', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getSinglePokemon', () => {
    it('should fetch details of a single Pokemon', () => {
      const mockResponse = {
        name: 'pikachu',
        weight: '60',
        sprites: { front_default: 'pikachu-sprite.png' },
      };

      service.getSinglePokemon('25').subscribe((pokemon) => {
        expect(pokemon).toBeTruthy();
        expect(pokemon?.name).toBe('pikachu');
        expect(pokemon?.weight).toBe('60');
        expect(pokemon?.sprites.front_default).toBe('pikachu-sprite.png');
      });

      const req = httpMock.expectOne(`${environment.pokeApiBaseUrl}pokemon/25`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors when fetching a single Pokemon', () => {
      service.getSinglePokemon('9999').subscribe((pokemon) => {
        expect(pokemon).toBeNull();
      });

      const req = httpMock.expectOne(
        `${environment.pokeApiBaseUrl}pokemon/9999`,
      );
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('extractIDFromUrl', () => {
    it('should extract ID from a given URL', () => {
      const url = 'https://pokeapi.co/api/v2/pokemon/25/';
      const id = (service as any).extractIDFromUrl(url);
      expect(id).toBe('25');
    });
  });
});
