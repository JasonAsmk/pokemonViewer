import { Component, Input } from '@angular/core';

@Component({
  selector: 'pokemon-view-card',
  templateUrl: 'pokemon-view-card.component.html',
  styleUrls: ['pokemon-view-card.component.scss'],
  imports: [],
})
export class PokemonViewCard {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) weight!: string;
  @Input({ required: true }) spriteUrl: string | null | undefined = null;
}
