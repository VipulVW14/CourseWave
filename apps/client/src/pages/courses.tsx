import { Button } from "ui";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router.js";
import { Course } from "store";

// import { NEXT_URL } from "@/config";

function Courses() {
    const [courses, setCourses] = useState([]);

    const init = async () => {
        const response = await axios.get(`/api/admin/courses/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        setCourses(response.data.courses);
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

    return <div style={{
        margin: 10,
        width: 300,
        minHeight: 200,
        padding: 20
    }}>
        <h1>{course.title}</h1>
        <h1>{course.description}</h1>

        <img src={course.imageLink} style={{width: 300}} ></img>

        <div style={{display: "flex", justifyContent: "center", marginTop: 20}}>
            <Button 
                text="Edit"
                onClick={() => {
                    router.push("/course/" + course._id);
                }}
            />
        </div>
    </div>
}

export default Courses;
