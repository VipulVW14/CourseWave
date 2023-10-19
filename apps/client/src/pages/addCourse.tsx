import {Button} from "ui";
import {useState} from "react";
import axios from "axios";

function AddCourse() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [price, setPrice] = useState(0);

    return <div className="w-full max-w-xs">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" for="title">
            Title
            </label>
            <input onChange={(e) => { setTitle(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="title" type="text" placeholder="Title"/>
        </div>
        <div className="mb-1">
            <label className="block text-gray-700 text-sm font-bold mb-2" for="description">
            Description
            </label>
            <input onChange={(e) => { setTitle(e.target.value) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="descriptio" type="text" placeholder="Description"/>
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" for="title">
            Image Link
            </label>
            <input onChange={(e) => { setTitle(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="imagelink" type="text" placeholder="Image Link"/>
        </div>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" for="description">
            Price
            </label>
            <input onChange={(e) => { setTitle(e.target.value) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="price" type="text" placeholder="Price"/>
        </div>

        <div className="flex items-center justify-between">
            <button 
            text="Add"
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
            Add Course
            </button>
        </div>

        </form>     
    </div>
}

export default AddCourse;