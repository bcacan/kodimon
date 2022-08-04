import { createRouter } from "./context";
import { z } from "zod";
import axios from "axios";
import { PokemonInfo, IState } from "../../types/pokemon";
import { randomPokeID, round2Decimals } from "../../utils/math";

const State = new Map<number, IState>();

const MISS_CHANCE = 0.2;

export const pokeApiRouter = createRouter()
  .mutation("newPokemons", {
    input: z.object({
      userID: z.number(),
    }),
    async resolve({ input }) {
      State.set(input.userID, {
        pokemons: await getTwoPokemons(),
        turn: 1,
        endGame: { end: false, won: { name: "", player: false } },
      });

      const userState = State.get(input.userID)!;
      const msg = `${userState.pokemons.first.name} and ${userState.pokemons.second.name} appeared`;

      console.log("state:", State);
      return { logMsg: msg };
    },
  })
  .query("getState", {
    input: z.object({
      userID: z.number(),
    }),
    resolve({ input }) {
      const userState = State.get(input.userID);
      return userState;
    },
  })
  .query("getStats", {
    input: z.object({
      userID: z.number(),
    }),
    resolve({ input }) {
      const userState = State.get(input.userID)!;
      return {
        first: userState.pokemons.first.stats,
        second: userState.pokemons.second.stats,
      };
    },
  })
  .mutation("attack", {
    input: z.object({
      userID: z.number(),
    }),
    resolve({ input }) {
      const userState = State.get(input.userID)!;
      if (!userState.pokemons || !userState.turn) return null;

      const { activePokemon, inactivePokemon, animatePokemon } = whoIsOnTurn(userState)!;

      userState.turn++;

      // Calc effective defense
      const { effectiveDefense, missMultiplier } = (() => {
        let i = 1;
        let effectiveDef = inactivePokemon.stats.defense;
        while (effectiveDef >= 100) {
          effectiveDef = effectiveDef / 2;
          i++;
        }
        return { effectiveDefense: effectiveDef, missMultiplier: i };
      })();

      // Check miss chance
      if (Math.random() < MISS_CHANCE * missMultiplier)
        return {
          animatePoke: { side: animatePokemon, miss: 1, damage: 0 },
          endGame: userState.endGame,
          newTurn: userState.turn,
          logMsg: `${activePokemon.name} missed ${inactivePokemon.name}`,
        };

      // Calc effective attack
      const effectiveAttack = round2Decimals(
        (activePokemon.stats.attack / 2) * (1 - effectiveDefense / 100),
      );

      // Calc reduced HP
      inactivePokemon.stats.hp = round2Decimals(
        inactivePokemon.stats.hp - effectiveAttack,
      );

      // Death check
      let deadMsg = "";
      if (inactivePokemon.stats.hp < 0) {
        inactivePokemon.stats.hp = 0;
        deadMsg = `\n ${inactivePokemon.name} died`;
        userState.endGame.end = true;
        userState.endGame.won.name = activePokemon.name;
        if (activePokemon == userState.pokemons.first)
          userState.endGame.won.player = true;
      }

      return {
        animatePoke: { side: animatePokemon, miss: 0, damage: effectiveAttack },
        endGame: userState.endGame,
        newTurn: userState.turn,
        logMsg: `${activePokemon.name} attacked ${inactivePokemon.name} for ${effectiveAttack} dmg${deadMsg}`,
      };
    },
  })
  .query("arrowDirection", {
    input: z.object({
      userID: z.number(),
    }),
    resolve({ input }) {
      const userState = State.get(input.userID)!;

      if (whoIsOnTurn(userState)!.activePokemon == userState?.pokemons.first) return true;
      return false;
    },
  })
  .query("endGame", {
    input: z.object({
      userID: z.number(),
    }),
    resolve({ input }) {
      const userState = State.get(input.userID)!;

      return userState.endGame;
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
      fullHp: stats_2[0].base_stat,
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
  const id = randomPokeID();

  // Check if new ID is same as input ID (first poke)
  if (id === takenID) fetchPokemon(takenID);
  else {
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if (data.name) return data; // pokemon exists
    fetchPokemon(takenID); // fetch failed (doesn't exist), repeat fetch
  }
};

const whoIsOnTurn = (userState: IState) => {
  if (!userState.pokemons) return null;

  // If first Poke is faster, it attacks first - else second Poke attacks first
  const firstIsFaster =
    userState.pokemons.first.stats.speed > userState.pokemons.second.stats.speed;
  const firstToAttack = firstIsFaster
    ? userState.pokemons.first
    : userState.pokemons.second;
  const secondToAttack = firstIsFaster
    ? userState.pokemons.second
    : userState.pokemons.first;

  // If turn is odd, left Poke attacks - else right Poke attacks
  const oddTurn = userState.turn % 2 === 1;
  const activePokemon = oddTurn ? firstToAttack : secondToAttack;
  const inactivePokemon = oddTurn ? secondToAttack : firstToAttack;

  // Animate left or right poke
  const animatePokemon = activePokemon === userState.pokemons.first ? "first" : "second";

  return { activePokemon, inactivePokemon, animatePokemon };
};
