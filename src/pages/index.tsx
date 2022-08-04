import type { NextPage } from "next";
import router from "next/router";
import { Button } from "../components/Button";

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
