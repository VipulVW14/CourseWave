import { Button } from "ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/router.js";
import { Course } from "store";
import { getAllCourses} from "../../../backend/client/client"
import {signIn, useSession, signOut} from "next-auth/react"

// import { NEXT_URL } from "@/config";

function Courses() {
    const session = useSession();
    
    const [courses, setCourses] = useState<Course[]>([]);

    const init = async () => {
        const response : any = await getAllCourses();
        setCourses(response);
    }

    useEffect(() => {
        init();
    }, []);

    return <div>
        <div className="flex flex-wrap justify-center w-full h-full bg-slate-100">
            {session.data && courses.map( course => {
                return <Course course={course} />
            }) 
            }
        </div>
        {!session.data && <div className=" mt-12 flex flex-wrap justify-center ">
                <p className="text-4xl mb-3 mr-4">You are logged out!</p>
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
        }
    </div>
}

export function Course({course}: {course: Course}) {
    const router = useRouter();

    return <div className="bg-white shadow-md rounded-lg mx-5 my-4">
        <img src={course.imageLink} className="max-w-sm rounded-t-lg"></img>

        <div className="m-3">
            <h1 className="text-xl">{course.title}</h1>
            <h1 className="text-slate-500">{course.description}</h1>
            <h2 className="mt-1">Rs.{course.price}</h2>

            <div className="flex justify-center mb-4">
                <Button 
                    text="Edit"
                    onClick={() => {
                        router.push("/courseid/" + course.id);
                    }}
                />
            </div>
        </div>
    </div>
}

export default Courses;

 