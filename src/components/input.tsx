import React from "react";

function Input(props: React.HTMLProps<HTMLInputElement>) {
  let classNames =
    "w-full bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white";

  if (props.className) {
    classNames = `${classNames} ${props.className}`;
  }

  return <input {...props} className={classNames} />;
}

export default Input;
