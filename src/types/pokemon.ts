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

export interface IState {
  pokemons: PokemonsObj;
  turn: number;
  endGame: {
    end: boolean;
    won: { name: string; player: boolean };
  };
}

export interface ButtonProps {
  text: string;
  onClick(): void;
  disabled?: boolean;
}

export interface IanimatePoke {
  side: string;
  miss: number;
  damage: number;
}
export interface IanimatePokeFun {
  (animatePoke: IanimatePoke): Promise<void>;
}
