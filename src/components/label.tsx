import React from "react";

interface LabelProps extends React.HTMLProps<HTMLLabelElement> {
  children: string;
}

function Label({ children, ...props }: LabelProps) {
  return (
    <label className="block text-gray-700 text-sm font-bold mb-2" {...props}>
      {children}
    </label>
  );
}

export default Label;
