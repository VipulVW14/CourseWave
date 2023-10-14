import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Button } from "ui";
import {signIn, useSession, signOut} from "next-auth/react"
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const session = useSession();
  console.error(session)

  return (
    <div style={{height: 60, background: "white", padding: 10}}>

      {session.data && <div style={{display: "flex", justifyContent: "space-between"}}>
        <h2 style={{color: "black"}}>
          {session.data.user?.email}
        </h2>

        <div>
          <Button type="Logout" onClick={() => signOut()}/>
        </div>
      </div>}
        
      {!session.data && <div style={{display: "flex", justifyContent: "space-between"}}>
        <h1 className="">
          Coursera
        </h1>
        
        <div>
          <Button type="Sign up" onClick={() => signIn()}/>
        </div>

      </div>}
    </div>
  )
}