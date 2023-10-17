import { Button } from "ui";
import axios from "axios";
import { useRouter } from "next/router.js";
import { Course } from "store";
// import { NEXT_URL } from "@/config";

function Courses({courses}: {courses: Course[]}) {
    return <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
        {courses.map(course => {
            return <Course course={course} />}
        )}
    </div>
}

function Course({course}: {course: Course}) {
    const router = useRouter();

    return <div style={{
        margin: 10,
        width: 300,
        minHeight: 200,
        padding: 20
    }}>
        <h1>{course.title}</h1>
        <h1>{course.description}</h1>
        <img src={course.imageLink} style={{width: 300}}/>
        <div style={{display: "flex", justifyContent: "center", marginTop: 20}}>
            <Button text="Edit" onClick={() => {
                router.push("/course/" + course._id);
            }}/>
        </div>
    </div>
}
export default Courses;

export async function getServerSideProps() {
    console.log("hit here")
    const response = await axios.get(`/api/admin/courses/`, {
        headers: {
            // Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
    console.log(response.data);

    return {
      props: {
        courses: response.data.courses,
      },
    };
}
  