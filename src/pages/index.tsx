import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import router from "next/router";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

const Home: NextPage = () => {
  return (
    <>
      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-10 pb-20">
        <img src="/assets/kodimon.png" />

        <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
          <Button text="New game" onClick={() => router.push("/fight")} />
        </div>
      </main>
    </>
  );
};

export default Home;
