export interface PokemonInfo {
  id: number;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  img: string;
}

export interface PokemonsObj {
  first: PokemonInfo;
  second: PokemonInfo;
}

export interface State {
  pokemons?: PokemonsObj;
}
