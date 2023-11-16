"use client";

export function GrayTopper(props: any){
    return <div className="w-full h-40 bg-slate-700 text-white">
        <p className="text-center pt-14 align-text-bottom font-mono tracking-wider text-5xl">{props.text}</p>
    </div> 
}