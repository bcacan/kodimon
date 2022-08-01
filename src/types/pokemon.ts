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
    fullHp: number;
  };
}

export interface PokemonsObj {
  first: PokemonInfo;
  second: PokemonInfo;
}

export interface State {
  pokemons?: PokemonsObj;
  turn: number;
  end: number;
}

export interface ButtonProps {
  text: string;
  onClick(): void;
  disabled?: boolean;
}
