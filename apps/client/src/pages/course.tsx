import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import {Button} from "ui";
import axios from "axios";

function Course() {
    let { courseId } = useParams();
    const [course, setCourse] = useState({});
    console.log(courseId);
    useEffect(() => {
        axios.get("http://localhost:3001/admin/course/" + courseId, {
            method: "GET",
        }).then(res => {
            setCourse(res.data.course);
            console.log(course);
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
    return <div style={{height: 250, background: "#212121", top: 0, width: "100vw", zIndex: 0, marginBottom: -250}}>
        <div style={{ height: 250, display: "flex", justifyContent: "center", flexDirection: "column"}}>
            <div>
                <h1 style={{color: "white", fontWeight: 600}}>
                    {title}
                </h1>
            </div>
        </div>
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
    return <div style={{display: "flex",  marginTop: 50, justifyContent: "center", width: "100%"}}>
     <div style={{
        margin: 10,
        width: 350,
        minHeight: 200,
        borderRadius: 20,
        marginRight: 50,
        paddingBottom: 15,
        zIndex: 2
    }}>
        <img src={course.imageLink} style={{width: 350}} ></img>
        <div style={{marginLeft: 10}}>
            <h1>{course.title}</h1>
            <h1 style={{color: "gray"}}>
                Price
            </h1>
            <h1>
                <b>Rs {course.price} </b>
            </h1>
        </div>
    </div>
    </div>
}

export default Course;