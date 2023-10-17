import {Button} from "ui";
import {useState} from "react";
import axios from "axios";

function AddCourse() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [price, setPrice] = useState(0)

    return <div style={{display: "flex", justifyContent: "center", minHeight: "80vh", justifyContent: "center", flexDirection: "column"}}>
        <div style={{display: "flex", justifyContent: "center"}}>
            <div style={{width: 400, padding: 20, marginTop: 30, height: "100%"}}>
                <input
                    style={{marginBottom: 10}}
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                    value="Title"
                />

                <input
                    style={{marginBottom: 10}}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                    value="Description"
                />

                <input
                    style={{marginBottom: 10}}
                    onChange={(e) => {
                        setImage(e.target.value)
                    }}
                    value="Image link"
                 />

                <input
                    style={{marginBottom: 10}}
                    onChange={(e) => {
                        setPrice(e.target.value)
                    }}
                    value="Price"
                 />

                <Button
                    text="Add course"
                    size={"large"}
                    variant="contained"
                    onClick={async () => {
                        await axios.post("http://localhost:3000/admin/courses", {
                            title: title,
                                description: description,
                                imageLink: image,
                                published: true,
                                price
                        }, {
                            headers: {
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            }
                        });
                        alert("Added course!");
                    }}
                />
            </div>
        </div>
    </div>
}

export default AddCourse;