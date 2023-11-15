import { Button } from "ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/router.js";
import { Course } from "store";
import {useSession} from "next-auth/react"
import { getAllCourses} from "../../../backend/client/client"

// import { NEXT_URL } from "@/config";

// const session = useSession();
// console.log(session);

function Courses() {
    const [courses, setCourses] = useState([]);

    const init = async () => {
        const response = await getAllCourses();
        setCourses(response);
    }

    useEffect(() => {
        init();
    }, []);

    return <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
        { courses.map( course => {
            return <Course course={course} />
          }) 
        }

    </div>
}

export function Course({course}: {course: Course}) {
    const router = useRouter();

    return <div className="bg-white shadow-lg rounded-lg m-5">
        <img src={course.imageLink} style={{width: 300}} className="rounded-t-lg"></img>

        <div className="m-3">
            <h1 className="text-xl">{course.title}</h1>
            <h1 className="text-slate-500">{course.description}</h1>
            <h2 className="mt-1">Rs.{course.price}</h2>

            <div className="flex justify-center ">
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

