import { ButtonProps } from "../types/pokemon";

export const Button = (props: ButtonProps) => {
  const { text, disabled, onClick } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 px-16 rounded-full ring-4 ring-blue-light bg-blue text-white enabled:hover:ring-2 disabled:opacity-30"
    >
      {text}
    </button>
  );
};
