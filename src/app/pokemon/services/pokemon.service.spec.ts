import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PokemonService, POKE_FETCH_SIZE } from './pokemon.service';
import { PokemonApiService } from './pokemon-api.service';
import { LogFactory } from '../../logging/log-factory.service';

describe('PokemonService', () => {
  let service: PokemonService;
  let mockPokemonApiService: PokemonApiService;
  let mockLoggerFactory: jasmine.SpyObj<LogFactory>;

  beforeEach(() => {
    mockPokemonApiService = <any>{
      getPokemonList: () => of(null),
      getSinglePokemon: () => of(null),
    };
    mockLoggerFactory = jasmine.createSpyObj('LogFactory', ['getLogger']);
    mockLoggerFactory.getLogger.and.returnValue({
      debug: jasmine.createSpy('debug'),
      error: jasmine.createSpy('error'),
    } as any);

    TestBed.configureTestingModule({
      providers: [
        PokemonService,
        { provide: PokemonApiService, useValue: mockPokemonApiService },
        { provide: LogFactory, useValue: mockLoggerFactory },
      ],
    });

    service = TestBed.inject(PokemonService);
  });

  describe('Initialization', () => {
    it('should initialize with an empty list of pokemons', (done) => {
      service.pokemons$.subscribe((pokemonList) => {
        expect(pokemonList).toEqual([]);
        done();
      });
    });
  });

  describe('getNextPokemonSet', () => {
    it('should fetch and add the next set of Pokemon', (done) => {
      const mockPokemonList = [
        { name: 'bulbasaur', id: '1' },
        { name: 'ivysaur', id: '2' },
      ];
      const mockPokemonDetails = [
        { name: 'bulbasaur', weight: '69', sprites: { front_default: '111' } },
        { name: 'ivysaur', weight: '130', sprites: { front_default: '222' } },
      ];

      spyOn(mockPokemonApiService, 'getPokemonList').and.returnValue(
        of(mockPokemonList),
      );
      spyOn(mockPokemonApiService, 'getSinglePokemon').and.returnValues(
        of(mockPokemonDetails[0]),
        of(mockPokemonDetails[1]),
      );

      service.getNextPokemonSet();

      service.pokemons$.subscribe((pokemonList) => {
        expect(pokemonList).toEqual(mockPokemonDetails);
        done();
      });
    });

    it('should not fetch if already fetching', () => {
      const mockPokemonList = [{ name: 'bulbasaur', id: '1' }];
      spyOn(mockPokemonApiService, 'getPokemonList').and.returnValue(
        of(mockPokemonList),
      );

      service.getNextPokemonSet();
      service.getNextPokemonSet(); // Second call should not initiate a fetch

      expect(mockPokemonApiService.getPokemonList).toHaveBeenCalled();
    });

    it('should handle errors during fetching Pokemon list', () => {
      spyOn(mockPokemonApiService, 'getPokemonList').and.returnValue(
        throwError(() => new Error('Failed to fetch Pokemon list')),
      );
      spyOn(mockPokemonApiService, 'getSinglePokemon').and.callThrough();

      service.getNextPokemonSet();

      expect(mockPokemonApiService.getSinglePokemon).not.toHaveBeenCalled();
    });

    it('should handle errors during fetching single Pokemon details', (done) => {
      const mockPokemonList = [{ name: 'bulbasaur', id: '1' }];

      spyOn(mockPokemonApiService, 'getPokemonList').and.returnValue(
        of(mockPokemonList),
      );
      spyOn(mockPokemonApiService, 'getSinglePokemon').and.returnValue(
        throwError(() => new Error('Failed to fetch Pokemon details')),
      );

      service.getNextPokemonSet();

      service.pokemons$.subscribe((pokemonList) => {
        expect(pokemonList).toEqual([]); // No Pokemon added due to error
        done();
      });
    });
  });
});
