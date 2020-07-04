import React from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.HTMLProps<HTMLInputElement>
>((props, ref) => {
  let classNames =
    "w-full bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white";

  if (props.className) {
    classNames = `${classNames} ${props.className}`;
  }

  return <input ref={ref} {...props} className={classNames} />;
});

export default Input;
