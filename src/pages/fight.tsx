import dynamic from "next/dynamic";
import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { IanimatePoke, IanimatePokeFun } from "../types/pokemon";
import { useEffect, useRef, useState } from "react";
import { atom, useAtom } from "jotai";
import Modal from "react-modal";
import { Button } from "../components/Button";
import { Menu } from "../components/Menu";
import { randomUserID, getRandomNum } from "../utils/math";
import { animated, useSpring, useSpringRef, useTransition } from "@react-spring/web";

const logs = atom("");
const initLogs = atom("");
const uidState = atom(randomUserID());

export const modal = atom({ open: false, wonName: "", wonPlayer: false });

const FightScreen: NextPage = () => {
  const utils = trpc.useContext();
  const setNewPokemons = trpc.useMutation(["pokeApi.newPokemons"]);
  const [, setInitLogs] = useAtom(initLogs);
  const [modalOpen, setModalOpen] = useAtom(modal);
  const [uid] = useAtom(uidState);

  useEffect(() => {
    setModalOpen({ open: false, wonName: "", wonPlayer: false });
    // Initialize new state for a game
    const initPokemons = () => {
      setNewPokemons.mutate(
        { userID: uid },
        {
          onSuccess: (data) => {
            setInitLogs(`${data.logMsg} \n`);
            utils.invalidateQueries(["pokeApi.getState"]);
            utils.invalidateQueries(["pokeApi.arrowDirection"]);
          },
        },
      );
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
          <div className="w-10/12 flex flex-row items-start gap-4">
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

const LazyFightScreen = dynamic(() => Promise.resolve(FightScreen), {
  ssr: false,
});
export default LazyFightScreen;

const PokeStage = () => {
  const [uid] = useAtom(uidState);

  const state = trpc.useQuery(["pokeApi.getState", { userID: uid }], {
    refetchOnWindowFocus: false,
    //enabled: false, // disable this query from automatically running (on pageload)
  });

  // Pokemons (title & image) div ref
  const firstPokeRef = useRef<HTMLDivElement>(null);
  const secondPokeRef = useRef<HTMLDivElement>(null);
  // Pokemons div animation
  const [stylesFirstPoke, animateFirstPoke] = useSpring({ from: { x: 0, y: 0 } }, []);
  const [stylesSecondPoke, animateSecondPoke] = useSpring({ from: { x: 0, y: 0 } }, []);

  // Damage message state and ref
  const damageMsg = useRef({ text: "", position: [0, 0] });
  const [showDamage, setDamage] = useState(false);
  // Damage message transition
  const transitions = useTransition(showDamage, {
    from: {
      opacity: 0,
      x: damageMsg.current.position[0],
      y: damageMsg.current.position[1],
    },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    //reverse: showDamage,
    delay: 450,
    //config: config.molasses,
    onRest: () => setDamage(false),
  });

  // Fun that animates: "active pokemon attacks another one" and display applied damage message
  const animateAttack = async (animatePoke: IanimatePoke) => {
    const { side, miss, damage } = animatePoke;

    const checkSide = side === "first";
    const animatedP = checkSide ? firstPokeRef : secondPokeRef;
    const passiveP = checkSide ? secondPokeRef : firstPokeRef;
    const animateAPI = checkSide ? animateFirstPoke : animateSecondPoke;
    const directionOffest = checkSide ? -0.8 : 0.8;

    const animP = animatedP.current!.getBoundingClientRect();
    const passP = passiveP.current!.getBoundingClientRect();
    const goToX =
      passP.x + passP.width / 2 - animP.x - animP.width / (2 + directionOffest);
    const goToY = -passP.y * 0.5;

    await animateAPI.start({
      to: [
        {
          x: goToX / 3,
          y: goToY,
          onRest: () => {
            damageMsg.current.text = miss ? "Miss!" : `${damage}dmg!`;
            damageMsg.current.position = [goToX / 3.5, goToY / -1.5];
            console.log(goToX, goToY);
            setDamage(true);
          },
        },
        { x: goToX, y: miss ? getRandomNum(40, 100) : -passP.y / 10 },
        { x: goToX / 3, y: goToY },
        { x: 0, y: 0 },
      ],
    })[0];
  };

  if (state.isLoading || !state.data?.pokemons) return <>loading</>;
  return (
    <>
      <div className="w-full flex justify-evenly">
        <ShowPokemon
          forwardedRef={firstPokeRef}
          stylesPoke={stylesFirstPoke}
          pokeInfo={state.data?.pokemons.first}
        />
        <div className="flex flex-col justify-center gap-8">
          <Arrow />

          <AttackButton animateFun={animateAttack} />
        </div>
        <ShowPokemon
          forwardedRef={secondPokeRef}
          stylesPoke={stylesSecondPoke}
          pokeInfo={state.data?.pokemons.second}
        />
        {transitions(
          (styles, item) =>
            item && (
              <animated.span style={styles} className="absolute text-red font-bold">
                {damageMsg.current.text}
              </animated.span>
            ),
        )}
      </div>
    </>
  );
};

const ShowPokemon = (
  { pokeInfo, forwardedRef, stylesPoke }: any /*{
  pokeInfo: PokemonInfo;
  forwardedRef: RefObject;
}*/,
) => {
  const { name, img, side /*, stats*/ } = pokeInfo;
  const flipImg = side === "left";

  const HPbar = ({ side }: { side: string }) => {
    const [uid] = useAtom(uidState);

    const [stylesHPbar, animateHPbar] = useSpring({}, []);

    const stats = trpc.useQuery(["pokeApi.getStats", { userID: uid }], {
      refetchOnWindowFocus: false,
    });

    if (stats.isLoading || !stats.data) return <></>;
    const statsSide = side === "left" ? stats.data.first : stats.data.second;
    const { hp, fullHp } = statsSide;
    let hpPercentage = Math.round((hp / fullHp) * 100);

    animateHPbar.start({
      to: { width: `${hpPercentage}%` },
      delay: 300,
    });

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
          <animated.div
            style={stylesHPbar}
            className={`h-2.5 rounded-2xl ${barBgColor}`}
          ></animated.div>
        </div>
      </div>
    );
  };

  const Stats = ({ side }: { side: string }) => {
    const [uid] = useAtom(uidState);

    const stats = trpc.useQuery(["pokeApi.getStats", { userID: uid }], {
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
      <animated.div ref={forwardedRef} style={stylesPoke} className="my-6">
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
      </animated.div>
      <Stats side={side} />
    </div>
  );
};

const Arrow = () => {
  const [uid] = useAtom(uidState);

  const { data: yourTurn, isLoading } = trpc.useQuery(
    ["pokeApi.arrowDirection", { userID: uid }],
    {
      refetchOnWindowFocus: false,
    },
  );
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

const AttackButton = ({ animateFun }: { animateFun: IanimatePokeFun }) => {
  const utils = trpc.useContext();
  const attack = trpc.useMutation(["pokeApi.attack"]);
  const [, setLogs] = useAtom(logs);
  const [uid] = useAtom(uidState);

  const { data: yourTurn, isLoading } = trpc.useQuery(
    ["pokeApi.arrowDirection", { userID: uid }],
    {
      refetchOnWindowFocus: false,
    },
  );

  const [modalOpen, setModalOpen] = useAtom(modal); // modalOpen = endgame

  const doAttack = () => {
    attack.mutate(
      { userID: uid },
      {
        onSuccess: async (data?) => {
          await animateFun(data?.animatePoke!);
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
      },
    );
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
