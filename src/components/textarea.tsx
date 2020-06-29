import React from "react";

function Textarea(props: React.HTMLProps<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="bg-gray-200 border border-transparent rounded p-2 focus:outline-none focus:shadow-outline focus:bg-white"
    />
  );
}

export default Textarea;
