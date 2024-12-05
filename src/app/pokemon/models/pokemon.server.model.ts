export interface IPokemonServerModel {
  // many properties here, we actually only care about the image
  name: string;
  weight: string;
  sprites: ISprites;
}

interface ISprites {
  front_default: string;
}
