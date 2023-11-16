import { Button } from "ui";
import {signIn, useSession, signOut} from "next-auth/react"
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import { Router, useRouter } from 'next/router'
import {getServerSession} from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export default function Home() {
  const session = useSession();
  const router = useRouter();

  return (      
      <div className="grid grid-cols-12 p-5 w-100 m-10 ">
        <div className="col-span-12 ml-5 mt-8 sm:col-span-6">
          <p className="text-6xl font-bold">CourseWave</p>
          <p className="text-4xl mt-4 font-medium text-blue-800">A place to learn, earn and grow.</p>

          {!session.data && <div className="flex mt-9">
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
          }
          {session.data && <div className="mt-8">
              <p className="text-3xl font-normal mr-2">Visit our Courses</p>
              <div className="mt-4 ml-2 flex">
                    <Button onClick={() => { router.push("/courses") }} text="Courses"/>
              </div>
          </div> }
        </div>

        <div className="col-span-12 sm:col-span-12 md:col-span-6" style={{marginTop: 20}}>
          <img src={"https://i.postimg.cc/cL005L75/sigmund-AQTA5-E6m-CNU-unsplash.jpg"} className="h-400 w-600 rounded-md" alt={"course-image"}/>
        </div>
      </div>
  )
}

 