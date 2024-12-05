import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PokemonViewCard } from '../../components/pokemon-view-card/pokemon-view-card.component';
import { PokemonService } from '../../services/pokemon.service';
import { IPokemonServerModel } from '../../models/pokemon.server.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, map, Subject, throttleTime } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'pokemon-browser',
  imports: [PokemonViewCard, AsyncPipe],
  templateUrl: './pokemon-browser.component.html',
  styleUrl: './pokemon-browser.component.scss',
})
export class PokemonBrowserPageComponent implements OnInit, AfterViewInit {
  public pokemon$ = new Subject<IPokemonServerModel[]>();

  @ViewChild('list') list!: ElementRef;

  constructor(private _pokemonService: PokemonService) {}

  public ngOnInit(): void {
    this._pokemonService.pokemons$
      .pipe(untilDestroyed(this))
      .subscribe((newSet) => this.pokemon$.next(newSet));
  }

  public ngAfterViewInit(): void {
    this.monitorScrollPosition();
  }

  private monitorScrollPosition() {
    fromEvent(this.list.nativeElement, 'scroll')
      .pipe(
        throttleTime(500),
        map(() => this.list.nativeElement),
        untilDestroyed(this),
      )
      .subscribe((container) => {
        this.getMoreItemsOnScrollEnd(container);
      });
  }

  private getMoreItemsOnScrollEnd(container: any) {
    const threshold = 2000;
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;

    if (position >= height - threshold) {
      this._pokemonService.getNextPokemonSet();
    }
  }
}
