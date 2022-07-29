import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { PokemonInfo } from "../types/pokemon";

const FightScreen: NextPage = () => {
  const pokemons = trpc.useQuery(["pokeApi.getPokemons"]);

  return (
    <>
      <Head>
        <title> - Poke Fight</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container h-screen  ">
        <Link href="/">
          <button>{`<- End game`}</button>
        </Link>
        <main className="container mx-auto flex flex-col items-center p-4">
          {pokemons.data ? (
            <div className="flex gap-20">
              <ShowPokemon pokeInfo={pokemons.data?.TwoPokemons.firstPokemon} />
              <ShowPokemon pokeInfo={pokemons.data?.TwoPokemons.secondPokemon} />
            </div>
          ) : (
            pokemons.status
          )}
        </main>
      </div>
    </>
  );
};

export default FightScreen;

const ShowPokemon = ({ pokeInfo }: { pokeInfo: PokemonInfo }) => {
  const { name, hp, attack, defense, speed, img } = pokeInfo;

  return (
    <div>
      <img src={img} />
      <div>Name: {name}</div>
      <div>HP: {hp}</div>
      <div>Attack: {attack}</div>
      <div>Defense: {defense}</div>
      <div>Speed: {speed}</div>
    </div>
  );
};
