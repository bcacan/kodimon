import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { ButtonProps, PokemonInfo, PokemonsObj } from "../types/pokemon";
import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import Modal from "react-modal";
import { Button } from "../components/Button";
import router from "next/router";
import { Menu } from "../components/Menu";

const logs = atom("");
const initLogs = atom("");
export const modal = atom({ open: false, wonName: "", wonPlayer: false });

const FightScreen: NextPage = () => {
  const utils = trpc.useContext();
  const setNewPokemons = trpc.useMutation(["pokeApi.newPokemons"]);
  const [, setInitLogs] = useAtom(initLogs);
  const [modalOpen, setModalOpen] = useAtom(modal);

  useEffect(() => {
    setModalOpen({ open: false, wonName: "", wonPlayer: false });

    // Initialize new state for a game
    const initPokemons = () => {
      setNewPokemons.mutate(null, {
        onSuccess: (data) => {
          setInitLogs(`${data.logMsg} \n`);
          utils.invalidateQueries(["pokeApi.getState"]);
          utils.invalidateQueries(["pokeApi.arrowDirection"]);
        },
      });
    };
    initPokemons();
  }, []);

  return (
    <>
      <Head>
        <title> - Poke Fight</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container h-screen m-auto grid place-items-center">
        {/* <button className="m-2 p-2 block bg-blue">click</button> */}
        <main className="container mx-auto flex flex-col items-center p-4 gap-y-20">
          {/* 
          {!state.isLoading && state.data?.pokemons ? (
            <PokeStage pokemons={state.data.pokemons} />
          ) : (
            state.status
          )} */}
          <PokeStage />
          <div className="w-10/12 flex flex-row  items-start">
            <Menu />
            <LogBox />
          </div>
        </main>

        <Modal
          isOpen={modalOpen.open}
          //onRequestClose={this.closeModal}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.75)",
            },
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              border: "none",
              background: "none",
            },
          }}
          ariaHideApp={false}
        >
          <div className="mb-16 text-center text-white text-2xl">
            <b>{modalOpen.wonName} won!</b>
          </div>
          <Menu />
        </Modal>
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
            currentTarget.style.width = "60%";
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
  const [, setLogs] = useAtom(logs);

  const { data: yourTurn, isLoading } = trpc.useQuery(["pokeApi.arrowDirection"], {
    refetchOnWindowFocus: false,
  });

  const [modalOpen, setModalOpen] = useAtom(modal); // modalOpen = endgame

  const doAttack = () => {
    attack.mutate(null, {
      onSuccess: (data?) => {
        setLogs((curr) => `${curr} #${data?.newTurn! - 1}   ${data?.logMsg} \n`);
        utils.invalidateQueries(["pokeApi.getStats"]);
        utils.invalidateQueries(["pokeApi.arrowDirection"]);
        //utils.invalidateQueries(["pokeApi.endGame"]);
        if (data?.endGame.end)
          setModalOpen({
            open: true,
            wonName: data.endGame.won.name,
            wonPlayer: data.endGame.won.player,
          });
      },
    });
  };

  useEffect(() => {
    if (yourTurn || modalOpen.open) return;
    const timer = setTimeout(() => {
      doAttack();
    }, 1000);
    return () => clearTimeout(timer);
  }, [yourTurn]);

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
  const [logsText, setLogs] = useAtom(logs);
  const [initText, setInitLogs] = useAtom(initLogs);

  useEffect(() => {
    setLogs("");
    setInitLogs("");
  }, []);

  return (
    <textarea
      value={initText + logsText}
      disabled
      rows={10}
      className="w-6/12 ml-auto overflow-y-scroll scrollbar p-6 bg-yellow-light border-solid border-2 border-yellow rounded-xl"
    ></textarea>
  );
};
