import React from "react";
import { MotionProps } from "framer-motion";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  children: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps & MotionProps>(
  ({ children, type, whileHover, whileTap, ...props }, ref) => {
    let classNames =
      "bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline";

    if (props.className) {
      classNames = `${classNames} ${props.className}`;
    }

    return (
      <button ref={ref} {...props} className={classNames}>
        {children}
      </button>
    );
  }
);

export default Button;
