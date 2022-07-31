import { createRouter } from "./context";
import { z } from "zod";
import axios from "axios";
import { PokemonInfo, PokemonsObj, State } from "../../types/pokemon";
import { SocketAddress } from "net";
import { randomID, round2Decimals } from "../../utils/math";

let state: State = { turn: 0 };

const MISS_CHANCE = 0.2;

export const pokeApiRouter = createRouter()
  .mutation("newPokemons", {
    async resolve() {
      state.pokemons = await getTwoPokemons();
      state.turn = 1;
      const msg = `${state.pokemons.first.name} and ${state.pokemons.second.name} appeared`;
      return { logMsg: msg };
    },
  })
  .query("getState", {
    resolve() {
      return state;
    },
  })
  .query("getStats", {
    resolve() {
      return { first: state.pokemons?.first.stats, second: state.pokemons?.second.stats };
    },
  })
  .mutation("attack", {
    // input: z.object({
    //   num: z.string(),
    // }),
    resolve(/*{ input }*/) {
      if (!state.pokemons || !state.turn) return null;

      const { activePokemon, inactivePokemon } = whoIsOnTurn()!;

      state.turn++;

      const { effectiveDeffense, missMultiplier } = (() => {
        let i = 1;
        let effectiveDeffense = inactivePokemon.stats.defense;
        while (effectiveDeffense >= 100) {
          effectiveDeffense = effectiveDeffense / 2;
          i++;
        }
        return { effectiveDeffense: effectiveDeffense, missMultiplier: i };
      })();

      if (Math.random() < MISS_CHANCE * missMultiplier)
        return {
          newTurn: state.turn,
          logMsg: `${activePokemon.name} missed ${inactivePokemon.name}`,
        };

      const effectiveAttack = round2Decimals(
        (activePokemon.stats.attack / 2) * (1 - effectiveDeffense / 100),
      );
      inactivePokemon.stats.hp = round2Decimals(
        inactivePokemon.stats.hp - effectiveAttack,
      );

      return {
        newTurn: state.turn,
        logMsg: `${activePokemon.name} attacked ${inactivePokemon.name} for ${effectiveAttack} dmg`,
      };
    },
  })
  .query("arrowDirection", {
    resolve() {
      if (whoIsOnTurn()!.activePokemon == state.pokemons!.first) return true;
      return false;
    },
  });

const getTwoPokemons = async () => {
  const firstPokemon = await fetchPokemon();
  const secondPokemon = await fetchPokemon(firstPokemon.id);

  // Strip needed info from data
  // Assumption: stats array doesn't change item's places...
  // if it changes, should find correct stats by stats' names
  const { id: id_1, name: name_1, stats: stats_1 } = await firstPokemon;
  const firstPokemonStripped: PokemonInfo = {
    id: id_1,
    name: name_1[0].toUpperCase() + name_1.substring(1),
    stats: {
      hp: stats_1[0].base_stat,
      fullHp: stats_1[0].base_stat,
      attack: stats_1[1].base_stat,
      defense: stats_1[2].base_stat,
      speed: stats_1[5].base_stat,
    },
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id_1}.png`,
    side: "left",
  };

  const { id: id_2, name: name_2, stats: stats_2 } = await secondPokemon;
  const secondPokemonStripped: PokemonInfo = {
    id: id_2,
    name: name_2[0].toUpperCase() + name_2.substring(1),
    stats: {
      hp: stats_2[0].base_stat,
      fullHp: stats_1[0].base_stat,
      attack: stats_2[1].base_stat,
      defense: stats_2[2].base_stat,
      speed: stats_2[5].base_stat,
    },
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id_2}.png`,
    side: "right",
  };
  return { first: firstPokemonStripped, second: secondPokemonStripped };
};

const fetchPokemon = async (takenID?: number) => {
  const id = randomID();

  // Check if new ID is same as input ID (first poke)
  if (id === takenID) fetchPokemon(takenID);
  else {
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if (data.name) return data; // pokemon exists
    fetchPokemon(takenID); // fetch failed (doesn't exist), repeat fetch
  }
};

const whoIsOnTurn = () => {
  if (!state.pokemons) return null;

  // If first Poke is faster, it attacks first - else second Poke attacks first
  const firstIsFaster =
    state.pokemons.first.stats.speed > state.pokemons.second.stats.speed;
  const firstToAttack = firstIsFaster ? state.pokemons.first : state.pokemons.second;
  const secondToAttack = firstIsFaster ? state.pokemons.second : state.pokemons.first;

  // If turn is odd, left Poke attacks - else right Poke attacks
  const oddTurn = state.turn % 2 === 1;
  const activePokemon = oddTurn ? firstToAttack : secondToAttack;
  const inactivePokemon = oddTurn ? secondToAttack : firstToAttack;

  return { activePokemon, inactivePokemon };
};
