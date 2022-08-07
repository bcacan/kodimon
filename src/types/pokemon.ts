import { SpringValue } from "@react-spring/web";

export interface PokemonInfo {
  id: number;
  name: string;
  img: string;
  side: "left" | "right";
  stats: PokemonStats;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  fullHp: number;
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
  onClick(e?: any): void;
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

export interface IstylesPoke {
  x: SpringValue<number>;
  y: SpringValue<number>;
}

export interface IstylesDamage {
  text: SpringValue<string>;
  top: SpringValue<number>;
  left: SpringValue<number>;
  opacity: SpringValue<number>;
  rotate: SpringValue<number>;
}
