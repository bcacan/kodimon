import { useAtom } from "jotai";
import router from "next/router";
import { modal } from "../pages/fight";
import { Button } from "./Button";

export const Menu = () => {
  const [modalOpen, setModalOpen] = useAtom(modal);

  return (
    <div className="mx-auto px-11 py-9 border-2 border-yellow rounded-2xl bg-yellow-light flex flex-col gap-6">
      <Button text="Home" onClick={() => router.push("/")} />
      <Button
        onClick={() => setModalOpen((curr) => ({ ...curr, open: false }))}
        text="New game"
      />
      {modalOpen.wonPlayer ? <Button text="New opponent" onClick={() => 1} /> : null}
    </div>
  );
};
