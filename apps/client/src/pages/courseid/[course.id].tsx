'use client'
import { useParams } from "next/navigation";
import {Button} from "ui";
import { Course } from "store";
import { use, useEffect, useState, useSyncExternalStore } from "react";
import { getCourseById, updateCourseById } from "../../../../backend/client/client"

export default function Course(){
    let params = useParams();
    const courseId=Object.values(params)[0];    

    const [course, setCourse] = useState();

    const init= async()=>{
        const response= await getCourseById(courseId);
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
        <GrayTopper title={course.title}/>
        <div className="grid grid-cols-12 m-10 flex justify-center">
            <UpdateCard course={course} setCourse={setCourse} />
            <CourseCard course={course} />
        </div>
    </div>
}


function GrayTopper({title}){
    return <div className="w-full h-40 bg-slate-100">
        <p className="text-center pt-14 align-text-bottom font-mono tracking-wider text-5xl">{title}</p>
    </div>
}

function UpdateCard({course, setCourse}){
    console.log("Course in update card: ")
    console.log(course);
    
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [image, setImage] = useState(course.imageLink);
    const [price, setPrice] = useState(course.price);

    
    console.log(title);

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
            <input onChange={(e) => { setPrice(e.target.value) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" value={price}/>
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
                const response= await updateCourseById(course.id, updatedCourse);
                setCourse(response);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
            Update Course
            </button>
        </div>
        </form>  
    </div>       
}

function CourseCard(props){
    const course = props.course;
    return <div className="col-span-10 md:col-span-6 max-w-xs">
        {/* <h1 className="text-2xl mb-3 mt-4">Course Preview</h1> */}
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

  