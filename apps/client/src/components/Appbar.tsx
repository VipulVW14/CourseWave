import { Button } from "ui";
import { useRouter } from "next/router";
import { signIn, useSession, signOut } from "next-auth/react";
import {getServerSession} from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]'

function Appbar({}) {
    const router = useRouter();
    const session = useSession();

    return <div className="w-full h-full p-8 pl-12 pr-12 pb-15 bg-slate-100">
                
        {session.data && <div className="flex justify-between">
            <div className="flex flex-wrap">
                <a href='/'><img className="h-14 w-14 rounded-full" src='https://i.postimg.cc/SJ7wjZLc/Blue-White-Simple-Modern-Course-Logo-2.png' alt='Logo'/></a>        
                <h2 className="ml-4 mt-3 text-2xl font-medium">
                    Hi, {session.data.user?.name}
                </h2>
            </div>

            <div className="flex">
                <div className="mr-3">
                    <Button onClick={() => { router.push("/courses") }} text="Courses"/>
                </div>

                <div className="mr-11">
                    <Button onClick={() => { router.push("/addCourse") }} text="Add Course"/>
                </div>

                <div>
                    <Button onClick={() => signOut()} text="Logout" />
                </div>      
            </div>               
                
        </div>}

        {!session.data && <div className="flex justify-between">

            <div className="flex cursor-pointer" onClick={() => { router.push("/") }}>
                <a href='/'><img className="h-14 w-14 rounded-full" src='https://i.postimg.cc/SJ7wjZLc/Blue-White-Simple-Modern-Course-Logo-2.png'alt='Logo'/></a>        
                <p className="text-4xl font-medium ml-4 mt-2">CourseWave</p>
            </div>
        
        </div>}

    </div>              
}

export default Appbar;
