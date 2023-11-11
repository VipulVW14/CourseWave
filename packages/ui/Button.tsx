"use client";

export const Button = (props: any) => {
  return <button onClick={props.onClick} className=" h-14 text-xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
   {props.text}
</button>
};
