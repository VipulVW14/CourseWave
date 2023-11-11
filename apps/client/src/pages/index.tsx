import { Button } from "ui";
import {signIn, useSession, signOut} from "next-auth/react"
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import { Router, useRouter } from 'next/router'

export default function Home() {
  const session = useSession();
  const router = useRouter();
  console.log(session.data);

  return (      
      <div className="grid grid-cols-12 p-5 w-100 m-10 ">
        <div className="col-span-12 ml-5 mt-8 sm:col-span-6">
          <p className="text-6xl">CourseWave</p>
          <p className="text-4xl mt-5">A place to learn, earn and grow</p>

          {!session.data && <div className="flex mt-9">
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
          }
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-6" style={{marginTop: 20}}>
          <img src={"https://i.postimg.cc/cL005L75/sigmund-AQTA5-E6m-CNU-unsplash.jpg"} className="h-400 w-600" alt={"course-image"}/>
        </div>
      </div>
  )
}
