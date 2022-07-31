export interface PokemonInfo {
  id: number;
  name: string;
  img: string;
  side: "left" | "right";
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface PokemonsObj {
  first: PokemonInfo;
  second: PokemonInfo;
}

export interface State {
  pokemons?: PokemonsObj;
}

export interface ButtonProps {
  text: string;
  onClick(): void;
  disabled?: boolean;
}
