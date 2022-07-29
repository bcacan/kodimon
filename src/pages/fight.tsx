import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { PokemonInfo } from "../types/pokemon";
import { useEffect, useState } from "react";

const FightScreen: NextPage = () => {
  const [log, setLog] = useState("");
  const updateState = (logMsg: string) => {
    setLog((curr) => curr + logMsg + "\n");
    utils.invalidateQueries(["pokeApi.getState"]);
  };

  const utils = trpc.useContext();

  const setNewPokemons = trpc.useMutation(["pokeApi.newPokemons"]);
  const state = trpc.useQuery(["pokeApi.getState"], {
    refetchOnWindowFocus: false,
    //enabled: false, // disable this query from automatically running (on pageload)
  });
  const attackTest = trpc.useMutation(["pokeApi.randomAttack"]);
  const initPokemons = () => {
    setLog("");
    setNewPokemons.mutate(null, {
      onSuccess: (data) => {
        updateState(data.logMsg);
      },
    });
    //console.log("set new pokes");
  };

  useEffect(() => {
    initPokemons();
  }, []);

  const buttonHandler = () => {
    const num = "3";
    attackTest.mutate(/*{ num }*/ null, {
      onSuccess: (data) => {
        updateState(data.logMsg);
      },
    });
  };

  return (
    <>
      <Head>
        <title> - Poke Fight</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container h-screen m-auto">
        <Link href="/">
          <button className="p-2 block bg-blue-300">{`<- End game`}</button>
        </Link>
        <button className="m-2 p-2 block bg-blue-200" onClick={initPokemons}>
          init / refetch
        </button>

        <button className="m-2 p-2 block bg-blue-200" onClick={buttonHandler}>
          click
        </button>
        <main className="container mx-auto flex flex-col items-center p-4">
          {state.data && state.data.pokemons && state.isSuccess ? (
            <div className="flex gap-20">
              <ShowPokemon pokeInfo={state.data.pokemons.first} />
              <ShowPokemon pokeInfo={state.data.pokemons.second} />
            </div>
          ) : (
            state.status
          )}

          <textarea
            value={log}
            disabled
            rows={10}
            className="m-8 p-2 bg-gray-600 text-white w-full"
          ></textarea>
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
