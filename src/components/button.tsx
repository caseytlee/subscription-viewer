import React from "react";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  children: string;
}

function Button({ children, type, ...props }: ButtonProps) {
  return (
    <button
      className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
