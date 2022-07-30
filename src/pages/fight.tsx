import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { ButtonProps, PokemonInfo, PokemonsObj } from "../types/pokemon";
import { useEffect, useState } from "react";

const FightScreen: NextPage = () => {
  const utils = trpc.useContext();

  const setNewPokemons = trpc.useMutation(["pokeApi.newPokemons"]);
  const state = trpc.useQuery(["pokeApi.getState"], {
    refetchOnWindowFocus: false,
    //enabled: false, // disable this query from automatically running (on pageload)
  });
  const attackTest = trpc.useMutation(["pokeApi.randomAttack"]);

  const [log, setLog] = useState("");
  const updateState = (logMsg: string) => {
    setLog((curr) => curr + logMsg + "\n");
    utils.invalidateQueries(["pokeApi.getState"]);
  };

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
        <main className="container mx-auto flex flex-col items-center p-4 gap-y-20">
          {state.data && state.data.pokemons && state.isSuccess ? (
            <PokeStage pokemons={state.data.pokemons} />
          ) : (
            state.status
          )}

          <textarea
            value={log}
            disabled
            rows={10}
            className="p-6 bg-gray-600 text-white w-10/12 rounded-xl"
          ></textarea>
        </main>
      </div>
    </>
  );
};

export default FightScreen;

const PokeStage = ({ pokemons }: { pokemons: PokemonsObj }) => {
  const ShowPokemon = ({ pokeInfo }: { pokeInfo: PokemonInfo }) => {
    const { name, hp, attack, defense, speed, img, side } = pokeInfo;
    const flipImg = side === "left";

    const HPbar = () => {
      return (
        <div className="border-solid border-2 border-red-800 rounded-2xl">
          <div className="h-2.5 bg-red-500  rounded-2xl"></div>
        </div>
      );
    };

    return (
      <div className="flex flex-col justify-center gap-2">
        <HPbar />
        <div className="text-center">{name}</div>
        <img
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = "/assets/Kodi-logo.svg";
          }}
          src={img}
          className={`${flipImg ? "-scale-x-100" : ""} m-auto my-2`}
        />

        <div className="py-4 px-6 border-2 border-yellow-400 rounded-2xl bg-yellow-100">
          <div>HP: {hp}</div>
          <div>Attack: {attack}</div>
          <div>Defense: {defense}</div>
          <div>Speed: {speed}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-evenly">
      <ShowPokemon pokeInfo={pokemons.first} />
      <div className="flex flex-col justify-center gap-8">
        <img src="/assets/arrow.svg" className="mx-auto" />
        <Button text="Attack!" onClick={() => console.log("click")} />
      </div>
      <ShowPokemon pokeInfo={pokemons.second} />
    </div>
  );
};

const Button = (props: ButtonProps) => {
  const { text, disabled, onClick } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 px-14 rounded-full ring-4 ring-blue-300 bg-blue-500 text-white hover:ring hover:ring-blue-400 hover:bg-blue-600"
    >
      {text}
    </button>
  );
};
