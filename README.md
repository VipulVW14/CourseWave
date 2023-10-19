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
      <div className="grid grid-cols-12" style={{padding: "5vw"}}>
        <div className="col-span-12 sm:col-span-6">
          <p className="text-5xl">CourseWave</p>
          <p className="text-2xl mt-3">A place to learn, earn and grow</p>
          {!session.data && <div style={{display: "flex", marginTop: 20}}>
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
          }
        </div>

        <div className="col-span-12 sm:col-span-6"  style={{marginTop: 20}}>
          <img src={"https://img.freepik.com/free-vector/empty-classroom-interior-with-chalkboard_1308-65378.jpg"} width={500} height={400} alt={"course-image"}/>
        </div>
      </div>
  )
}
