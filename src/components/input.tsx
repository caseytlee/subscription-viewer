import React from "react";

function Input(props: React.HTMLProps<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white"
    />
  );
}

export default Input;
