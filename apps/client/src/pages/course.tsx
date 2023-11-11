'use client'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation";
import {Button} from "ui";
import axios from "axios";
import dynamic from "next/dynamic";

function Course() {
    let params = useParams();
    console.log(params);
    const [course, setCourse] = useState({});
  
    useEffect(() => {
        axios.get(`http://localhost:3001/admin/course/${courseId}`, {
            method: "GET",
        }).then(res => {
            setCourse(res.data.course);
        });
    }, []);
    console.log(course);
    
    if (!course) {
        return <div style={{height: "100vh", justifyContent: "center", flexDirection: "column"}}>
            Loading....
        </div>
    }

    return <div>
        <GrayTopper title={course.title}/>
        <div>
            <div>
                <UpdateCard course={course} setCourse={setCourse} />
            </div>
            <div>
                <CourseCard course={course} />
            </div>
        </div>
    </div>
}

function GrayTopper({title}) {
    return <div className="w-full h-40 bg-slate-100">
        <p className="text-center pt-12 align-text-bottom font-mono tracking-wider text-5xl">Add Course</p>
    </div>
}

function UpdateCard({course, setCourse}) {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [image, setImage] = useState(course.imageLink);
    const [price, setPrice] = useState(course.price);

    return <div style={{display: "flex", justifyContent: "center"}}>
    <div style={{maxWidth: 600, marginTop: 200}}>
        <div style={{padding: 20}}>
            <h1 style={{marginBottom: 10}}>Update course details</h1>
            <input
                value={title}
                style={{marginBottom: 10}}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
            />

            <input
                value={description}
                style={{marginBottom: 10}}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            />

            <input
                value={image}
                style={{marginBottom: 10}}
                onChange={(e) => {
                    setImage(e.target.value)
                }}
            />
            <input
                value={price}
                style={{marginBottom: 10}}
                onChange={(e) => {
                    setPrice(e.target.value)
                }}
            />

            <Button
                onClick={async () => {
                    axios.put("http://localhost:3000/admin/courses/" + course._id, {
                        title: title,
                        description: description,
                        imageLink: image,
                        published: true,
                        price
                    }, {
                        headers: {
                            "Content-type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    });
                    let updatedCourse = {
                        _id: course._id,
                        title: title,
                        description: description,
                        imageLink: image,
                        price
                    };
                    setCourse(updatedCourse);
                }}
                text="Update course"
            />
        </div>
    </div>
</div>
}

function CourseCard(props) {
    const course = props.course;
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
                        router.push("/courseid/" + course._id);
                    }}
                />
            </div>
        </div>
    </div>
}

export default Course;