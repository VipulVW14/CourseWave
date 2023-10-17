import { Button } from "ui";
import {signIn, useSession, signOut} from "next-auth/react"
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import { isUserLoading, userEmailState } from "store";
import { Router, useRouter } from 'next/router'
import { useRecoilValue } from 'recoil';


export default function Home() {
  const session = useSession();
  console.error(session)
  const router = useRouter();

  const userEmail = useRecoilValue(userEmailState);
  const userLoading = useRecoilValue(isUserLoading);

  return (
    <div>

      <div style={{height: 60, background: "white", padding: 10}}>
        {session.data && <div style={{display: "flex", justifyContent: "space-between"}}>
          <h2 style={{color: "black"}}>
            {session.data.user?.email}
          </h2>

          <div>
            <Button text="Logout" onClick={()=>signOut()}/>
          </div>
        </div>}
          
        {!session.data && <div style={{display: "flex", justifyContent: "space-between"}}>
          <h1 className="">
            CourseWave
          </h1>
          <div>
            <Button text="Signin" onClick={() => signIn()}/>
          </div>
        </div>}
      </div>

       
      <div className="grid grid-cols-12" style={{padding: "5vw"}}>
        <div className="col-span-12 sm:col-span-6">
          <h1>Coursera Admin</h1>
          <h1>A place to learn, earn and grow</h1>
          {!userLoading && !userEmail && <div style={{display: "flex", marginTop: 20}}>
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
          }
        </div>

        <div className="col-span-12 sm:col-span-6"  style={{marginTop: 20}}>
          <img src={"https://img.freepik.com/free-vector/empty-classroom-interior-with-chalkboard_1308-65378.jpg"} width={500} height={400} alt={"course-image"}/>
        </div>
      </div>
          
    </div>
  )
}