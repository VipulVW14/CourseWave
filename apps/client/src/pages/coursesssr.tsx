import { Button } from "ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/router.js";
import { Course } from "store";
import { getAllCourses} from "../../../backend/client/client"
import {signIn, useSession, signOut} from "next-auth/react"
// import { NEXT_URL } from "@/config";

function Courses({courses}: {courses: Course[]}) {
    const session = useSession();

    return <div className="flex flex-wrap justify-center">
        {session.data && courses.map( course => {
            return <Course course={course} />
          }) 
        }

        {!session.data && <div className=" mt-9">
                <p className="text-4xl mb-3">You are logged out!</p>
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
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

export async function getServerSideProps() {
    const response = await getAllCourses();

    return {
      props: {
        courses: response,
      },
    };
}