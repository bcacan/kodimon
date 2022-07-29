import { createRouter } from "./context";
import { z } from "zod";
import axios from "axios";
import { PokemonInfo } from "../../types/pokemon";

export const pokeApiRouter = createRouter().query("getPokemons", {
  async resolve() {
    const TwoPokemons = await getTwoPokemons();
    return { TwoPokemons };
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
    name: name_1,
    hp: stats_1[0].base_stat,
    attack: stats_1[1].base_stat,
    defense: stats_1[2].base_stat,
    speed: stats_1[5].base_stat,
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id_1}.png`,
  };

  const { id: id_2, name: name_2, stats: stats_2 } = secondPokemon;
  const secondPokemonStripped: PokemonInfo = {
    id: id_2,
    name: name_2,
    hp: stats_2[0].base_stat,
    attack: stats_2[1].base_stat,
    defense: stats_2[2].base_stat,
    speed: stats_2[5].base_stat,
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id_2}.png`,
  };
  return { firstPokemon: firstPokemonStripped, secondPokemon: secondPokemonStripped };
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
