import { ButtonProps } from "../types/pokemon";

export const Button = (props: ButtonProps) => {
  const { text, disabled, onClick } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mx-2 p-2 md:px-16 px-8 rounded-full ring-4 ring-blue-light bg-blue text-white enabled:hover:ring-2 disabled:opacity-30"
    >
      {text}
    </button>
  );
};
