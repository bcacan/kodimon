import { createRouter } from "./context";
import { z } from "zod";
import axios from "axios";
import { PokemonInfo, PokemonsObj, State } from "../../types/pokemon";

let state: State = {};

export const pokeApiRouter = createRouter()
  .mutation("newPokemons", {
    async resolve() {
      state.pokemons = await getTwoPokemons();

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
  .mutation("randomAttack", {
    // input: z.object({
    //   num: z.string(),
    // }),
    resolve(/*{ input }*/) {
      const roll = Math.random() < 0.5;
      const activePokemon = roll ? state.pokemons!.first : state.pokemons!.second;
      const inactivePokemon = roll ? state.pokemons!.second : state.pokemons!.first;
      const msg = `${activePokemon.name} attacks ${inactivePokemon.name}`;

      const roll2 = Math.random() < 0.2;
      if (roll2) return { logMsg: msg + ", but misses!" };

      const effectiveAttack =
        (activePokemon.stats.attack / 2) * (1 - inactivePokemon.stats.defense / 100);
      const effectiveAttackRounded = Math.round(effectiveAttack * 100) / 100;

      inactivePokemon.stats.hp -= effectiveAttackRounded;
      return {
        logMsg: msg + ` for ${effectiveAttackRounded} damage`,
      };
    },
  });

const getTwoPokemons = async () => {
  const firstPokemon = await fetchPokemon();
  const secondPokemon = await fetchPokemon(firstPokemon.id);

  //   console.log("---");
  //   console.log(firstPokemon.name, firstPokemon.id);
  //   console.log(secondPokemon.name, secondPokemon.id);
  //   console.log("---");

  // Strip needed info from data
  // Assumption: stats array doesn't change item's places...
  // if it changes, should find correct stats by stats' names
  const { id: id_1, name: name_1, stats: stats_1 } = firstPokemon;
  const firstPokemonStripped: PokemonInfo = {
    id: id_1,
    name: name_1[0].toUpperCase() + name_1.substring(1),
    stats: {
      hp: stats_1[0].base_stat,
      attack: stats_1[1].base_stat,
      defense: stats_1[2].base_stat,
      speed: stats_1[5].base_stat,
    },
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id_1}.png`,
    side: "left",
  };

  const { id: id_2, name: name_2, stats: stats_2 } = secondPokemon;
  const secondPokemonStripped: PokemonInfo = {
    id: id_2,
    name: name_2[0].toUpperCase() + name_2.substring(1),
    stats: {
      hp: stats_2[0].base_stat,
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
  console.log("new id:", id, "  vs.  takeid:", takenID);

  // Check if new ID is same as input ID (first poke)
  if (id === takenID) fetchPokemon(takenID);
  else {
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    // .catch((e) => {
    //   console.log(e.code);
    // });
    console.log("fetched:", data.id, data.name);

    if (data.name) return data; // pokemon exists
    fetchPokemon(takenID); // fetch failed (doesn't exist), repeat fetch
  }
};

const randomID = () => {
  const MAX_POKEMON_ID = 900; // 0~900 &  neki oko 10_000?
  const newRandomID = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  return newRandomID;
};
