import React from "react";

function Textarea(props: React.HTMLProps<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white"
      {...props}
    />
  );
}

export default Textarea;
