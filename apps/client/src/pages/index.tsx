import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Button } from "ui";
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
     <>
        <Button/>
        
         <h1 className="text-3xl font-bold underline">
           Hello world!
         </h1>
     </>
  )
}
