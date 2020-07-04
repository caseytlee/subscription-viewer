import React from "react";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.HTMLProps<HTMLTextAreaElement>
>((props, ref) => {
  let classNames =
    "w-full bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white";

  if (props.className) {
    classNames = `${classNames} ${props.className}`;
  }

  return <textarea ref={ref} {...props} className={classNames} />;
});

export default Textarea;
