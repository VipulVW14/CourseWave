import { Button } from "ui";
import { useRouter } from "next/router";
import { signIn, useSession, signOut } from "next-auth/react";

function Appbar({}) {
    const router = useRouter();
    const session = useSession();

    return <div className="h-14 flex justify-between m-4">
                  
        <a href='/'><img className="h-10 w-10 rounded-full" src='https://i.postimg.cc/SJ7wjZLc/Blue-White-Simple-Modern-Course-Logo-2.png'alt='Logo'/></a>        

        {session.data && <div className="flex justify-between">
          <h2 style={{color: "black"}}>
            {session.data.user?.email}
          </h2>
          
                <div className="flex mr-10">
                    <div style={{marginRight: 10}}>
                        <Button onClick={() => { router.push("/addCourse") }} text="Add course"/>
                    </div>

                    <div style={{marginRight: 10}}>
                        <Button onClick={() => { router.push("/courses") }} text="Courses"/>
                    </div>
                    
                    <div>
                        <Button onClick={() => signOut()} text="Logout" />
                    </div>
                </div>
                
        </div>}

        {!session.data && <div className="flex justify-between p-4 z-[1]">
                <div style={{marginLeft: 10, cursor: "pointer"}} onClick={() => { router.push("/") }}>
                    <p className="text-2xl m-1">CourseWave</p>
                </div>
        
            
                <div className="m-2">
                    <Button text="Signin" onClick={() => signIn()}/>
                </div>
        </div>}

    </div>
                    
}

export default Appbar;
