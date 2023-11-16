'use client'
import { useParams } from "next/navigation";
import { Button, GrayTopper } from "ui";
import { Course } from "store";
import { useRouter } from "next/router.js";
import { use, useEffect, useState, useSyncExternalStore } from "react";
import { getCourseById, updateCourseById } from "../../../../backend/client/client"
import {signIn, useSession, signOut} from "next-auth/react"


export default function updateCourse(){
    const session = useSession();
    const router = useRouter();

    let params = useParams();

    const courseId = Object.values(params)[0];    

    const [course, setCourse] = useState<{ title: string; description: string; imageLink: string; price: number; id: unknown } | undefined>();

    const init= async()=>{
        const response= await getCourseById(courseId.toString());
        setCourse(response);
    }
    
    useEffect(() => {
        init();
    }, []);

    if (!course) {
        return <div style={{height: "100vh", justifyContent: "center", flexDirection: "column"}}>
            Loading....
        </div>
    }

    return <div>
        <GrayTopper text={course.title}/>
        {session.data && <div className="grid grid-cols-12 m-10 flex justify-center">
            <UpdateCard course={course} setCourse={setCourse} />
            <CourseCard course={course} />
        </div>}

        {!session.data && <div className=" mt-9">
                <p className="text-4xl mb-3">You are logged out!</p>
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
        }
    </div>
}

interface UpdateCardProps {
    course: {
      title: string;
      description: string;
      imageLink: string;
      price: number;
      id: unknown;
    };
    setCourse: React.Dispatch<React.SetStateAction<{
      title: string;
      description: string;
      imageLink: string;
      price: number;
      id: unknown;
    } | undefined>>;
}

function UpdateCard({course, setCourse}: UpdateCardProps){
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [image, setImage] = useState(course.imageLink);
    const [price, setPrice] = useState(course.price);

    return <div className="w-full max-w-xs col-span-10 md:col-span-6">
        <form className="bg-white shadow-xl rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
            </label>
            <input onChange={(e) => { setTitle(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="title" type="text" value={title}/>
        </div>
        <div className="mb-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
            </label>
            <input onChange={(e) => { setDescription(e.target.value) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="descriptio" type="text" value={description}/>
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            Image Link
            </label>
            <input onChange={(e) => { setImage(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="imagelink" type="url" value={image}/>
        </div>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            Price          
            </label>
            <input onChange={(e) => { setPrice(Number(e.target.value)) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" value={price}/>
        </div>

        <div className="flex items-center justify-between">
            <button 
                onClick={async () => {
                    let updatedCourse = {
                        title: title,
                        description: description,
                        imageLink: image,
                        price: price
                    };
                    const response= await updateCourseById(course.id as string, updatedCourse);
                    await setCourse(response);
                    }
                }
                className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Update Course
            </button>
        </div>
        </form>  
    </div>       
}

function CourseCard({course}:{course:any}){
    
    return <div className="col-span-10 md:col-span-6 max-w-xs">
        <h1 className="text-2xl mb-3 mt-4">Course Preview</h1>
        <div className="bg-white shadow-lg rounded-lg h-75">
            <img src={course.imageLink} className="w-450 rounded-t-lg" ></img>
            <div className="m-2 ">
                <h1 className="text-lg">{course.title}</h1>
                <h1 style={{color: "gray"}}>
                    {course.description}
                </h1>
                <b>Rs. {course.price}</b>
            </div>       
        </div>           
    </div>
}

  