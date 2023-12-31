"use client";

export const Button = (props: any) => {
  return <button onClick={props.onClick} className="max-h-md h-15 text-xl bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-full">
      {props.text}
  </button>
};
