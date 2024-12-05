import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonBrowserComponent } from './pokemon-browser.component';

describe('PokemonBrowserComponent', () => {
  let component: PokemonBrowserComponent;
  let fixture: ComponentFixture<PokemonBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonBrowserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
