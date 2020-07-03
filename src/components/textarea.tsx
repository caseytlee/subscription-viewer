import React from "react";

function Textarea(props: React.HTMLProps<HTMLTextAreaElement>) {
  let classNames =
    "w-full bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white";

  if (props.className) {
    classNames = `${classNames} ${props.className}`;
  }

  return <textarea {...props} className={classNames} />;
}

export default Textarea;
