import { Button } from "ui";
import {signIn, useSession } from "next-auth/react"
import { Coiny, Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import { Router, useRouter } from 'next/router'

 
export default function Home() {
  const session = useSession();
  const router = useRouter();

  return <div className="grid grid-cols-12 p-5 px-14 w-full h-screen bg-slate-100">
        <div className="col-span-12 lg:col-span-6 pl-5 pt-12 ">
          <p className="text-6xl font-bold">CourseWave</p>
          <p className="text-4xl mt-4 font-medium text-blue-800">A place to learn, earn and grow.</p>

          {!session.data && <div className="flex mt-9">
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
          }
          {session.data && <div className="mt-8">
              <p className="text-3xl font-normal mr-2">Visit our Courses</p>
              <div className="mt-4 mb-4 flex">
                    <Button onClick={() => { router.push("/courses") }} rounded="rounded-md" text="Courses"/>
              </div>
          </div> }
        </div>

        <div className="col-span-12  lg:col-span-6 lg:pr-4 mr-14">
          <img src={"https://i.postimg.cc/cL005L75/sigmund-AQTA5-E6m-CNU-unsplash.jpg"} className="h-400 w-600 rounded-md" alt={"course-image"}/>
        </div>
    
  </div>
}

 