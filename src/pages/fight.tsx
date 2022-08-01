import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { ButtonProps, PokemonInfo, PokemonsObj } from "../types/pokemon";
import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { DEV_GET_MOUNTED } from "jotai/core/store";

const logs = atom("");
const initLogs = atom("");

const FightScreen: NextPage = () => {
  const utils = trpc.useContext();
  const setNewPokemons = trpc.useMutation(["pokeApi.newPokemons"]);
  const [, appendLogs] = useAtom(initLogs);

  useEffect(() => {
    const initPokemons = () => {
      //setLog("");
      setNewPokemons.mutate(null, {
        onSuccess: (data) => {
          appendLogs(data.logMsg + "\n");
          utils.invalidateQueries(["pokeApi.getState"]);
          utils.invalidateQueries(["pokeApi.arrowDirection"]);
        },
      });
      //console.log("set new pokes");
    };
    initPokemons();
  }, []);

  return (
    <>
      <Head>
        <title> - Poke Fight</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container h-screen m-auto">
        <Link href="/">
          <button className="p-2 block bg-blue-light">{`<- End game`}</button>
        </Link>
        <button className="m-2 p-2 block bg-blue" /*onClick={initPokemons}*/>
          init / refetch
        </button>

        {/* <button className="m-2 p-2 block bg-blue">click</button> */}
        <main className="container mx-auto flex flex-col items-center p-4 gap-y-20">
          {/* 
          {!state.isLoading && state.data?.pokemons ? (
            <PokeStage pokemons={state.data.pokemons} />
          ) : (
            state.status
          )} */}
          <PokeStage />
          <LogBox />
        </main>
      </div>
    </>
  );
};

export default FightScreen;

const PokeStage = () => {
  const state = trpc.useQuery(["pokeApi.getState"], {
    refetchOnWindowFocus: false,
    //enabled: false, // disable this query from automatically running (on pageload)
  });
  if (state.isLoading || !state.data?.pokemons) return <>loading</>;
  return (
    <>
      <div className="w-full flex justify-evenly">
        <ShowPokemon pokeInfo={state.data?.pokemons.first} />
        <div className="flex flex-col justify-center gap-8">
          <Arrow />

          <AttackButton />
        </div>
        <ShowPokemon pokeInfo={state.data?.pokemons.second} />
      </div>
    </>
  );
};

const Button = (props: ButtonProps) => {
  const { text, disabled, onClick } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 px-14 rounded-full ring-4 ring-blue-light bg-blue text-white enabled:hover:ring-2 disabled:opacity-30"
    >
      {text}
    </button>
  );
};

const ShowPokemon = ({ pokeInfo }: { pokeInfo: PokemonInfo }) => {
  const { name, img, side /*, stats*/ } = pokeInfo;

  const flipImg = side === "left";

  const HPbar = ({ side }: { side: string }) => {
    const stats = trpc.useQuery(["pokeApi.getStats"], {
      refetchOnWindowFocus: false,
      //enabled: false, // disable this query from automatically running (on pageload)
    });
    if (stats.isLoading || !stats.data?.first || !stats.data?.second) return <></>;

    const statsSide = side === "left" ? stats.data.first : stats.data.second;
    const { hp, fullHp } = statsSide;

    let hpPercentage = Math.round((hp / fullHp) * 100);

    // Set color of HP bar
    let barBgColor,
      barBorderColor = "";
    if (hpPercentage > 50) {
      barBgColor = "bg-green-light";
      barBorderColor = "border-green";
    } else if (hpPercentage > 30) {
      barBgColor = "bg-orange-light";
      barBorderColor = "border-orange";
    } else {
      barBgColor = "bg-red-light";
      barBorderColor = "border-red";
    }

    return (
      <div>
        <div className="text-center">{hpPercentage}%</div>
        <div className={`border-solid border-2 rounded-2xl ${barBorderColor}`}>
          <div className={`h-2.5 rounded-2xl ${barBgColor}`}></div>
        </div>
      </div>
    );
  };

  const Stats = ({ side }: { side: string }) => {
    const stats = trpc.useQuery(["pokeApi.getStats"], {
      refetchOnWindowFocus: false,
      //enabled: false, // disable this query from automatically running (on pageload)
    });
    if (stats.isLoading || !stats.data?.first || !stats.data?.second) return <></>;
    const statsSide = side === "left" ? stats.data.first : stats.data.second;
    const { hp, attack, defense, speed } = statsSide;

    return (
      <div className="py-4 px-6 border-2 border-yellow rounded-2xl bg-yellow-light">
        <div>HP: {hp}</div>
        <div>Attack: {attack}</div>
        <div>Defense: {defense}</div>
        <div>Speed: {speed}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center gap-2">
      <HPbar side={side} />
      <div className="my-6">
        <div className="text-center font-bold">{name}</div>
        <img
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = "/assets/Kodi-logo.svg";
          }}
          src={img}
          className={`${flipImg ? "-scale-x-100" : ""} m-auto`}
        />
      </div>
      <Stats side={side} />
    </div>
  );
};

const Arrow = () => {
  const { data: yourTurn, isLoading } = trpc.useQuery(["pokeApi.arrowDirection"], {
    refetchOnWindowFocus: false,
  });
  return (
    <>
      {!isLoading ? (
        <img
          src="/assets/arrow.svg"
          className={`${yourTurn ? "-scale-x-100" : ""} mx-auto`}
        />
      ) : null}
    </>
  );
};

const AttackButton = () => {
  const utils = trpc.useContext();
  const attack = trpc.useMutation(["pokeApi.attack"]);
  const [, appendLogs] = useAtom(logs);

  const { data: yourTurn, isLoading } = trpc.useQuery(["pokeApi.arrowDirection"], {
    refetchOnWindowFocus: false,
  });
  const [endGame, setEndGame] = useState(false);

  const doAttack = () => {
    attack.mutate(null, {
      onSuccess: (data?) => {
        appendLogs((curr) => `${curr} #${data?.newTurn! - 1}   ${data?.logMsg} \n`);
        utils.invalidateQueries(["pokeApi.getStats"]);
        utils.invalidateQueries(["pokeApi.arrowDirection"]);
        //utils.invalidateQueries(["pokeApi.endGame"]);
        if (data?.endGame === 1) setEndGame(true);
      },
    });
  };

  useEffect(() => {
    if (yourTurn || endGame) return;
    const timer = setTimeout(() => {
      console.log("autoattack");
      doAttack();
    }, 1000);
    return () => clearTimeout(timer);
  }, [yourTurn]);

  if (endGame) return <div> end game</div>;

  return (
    <>
      {!isLoading ? (
        <Button text="Attack!" onClick={() => doAttack()} disabled={!yourTurn} />
      ) : (
        "loading"
      )}
    </>
  );
};

const LogBox = () => {
  const [logsText] = useAtom(logs);
  const [initText] = useAtom(initLogs);

  return (
    <textarea
      value={initText + logsText}
      disabled
      rows={10}
      className="overflow-y-scroll scrollbar p-6 bg-yellow-light   w-10/12 border-solid border-2 border-yellow rounded-xl"
    ></textarea>
  );
};
