import {Button} from "ui";
import {useState} from "react";
import { addCourse } from "../../../backend/client/client"

function AddCourse() {
    const [title, setTitle] = useState("Title");
    const [description, setDescription] = useState("Description");
    const [image, setImage] = useState("https://picsum.photos/400/200");
    const [price, setPrice] = useState<number>(0);

    return <div>

        <div className="w-full h-40 bg-slate-100">
            <p className="text-center pt-14 align-text-bottom font-mono tracking-wider text-5xl">Add Course</p>
        </div>

        <div className="grid grid-cols-12 m-10 flex justify-center">

            <div className="w-full max-w-xs col-span-10 md:col-span-6">
                <form className="bg-white shadow-xl rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                    </label>
                    <input onChange={(e) => { setTitle(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="title" type="text" placeholder="Title"/>
                </div>
                <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                    </label>
                    <input onChange={(e) => { setDescription(e.target.value) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="descriptio" type="text" placeholder="Description"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                    Image Link
                    </label>
                    <input onChange={(e) => { setImage(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="imagelink" type="url" placeholder="Image Link"/>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                    Price          
                    </label>
                    <input onChange={(e) => { setPrice(parseInt(e.target.value)) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" placeholder="Price"/>
                </div>

                <div className="flex items-center justify-between">
                    <button 
                    onClick={async () => {                        
                        const newCourse={
                            title: title,
                            description: description,
                            imageLink: image,
                            price
                        }
                        const response = await addCourse(newCourse);

                        alert("Added course!");
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Add Course
                    </button>
                </div>
                </form>  
            </div>   

            
            <div className="col-span-10 md:col-span-6 max-w-xs">
                <h1 className="text-2xl mb-3 mt-4">Course Preview</h1>
                <div className="bg-white shadow-lg rounded-lg m-5">
                    <img src={image} className="w-450 rounded-t-lg" ></img>
                    <div className="m-2 ">
                        <h1 className="text-lg">{title}</h1>
                        <h1 style={{color: "gray"}}>
                            {description}
                        </h1>
                        <b>Rs. {price}</b>
                    </div>       
                </div>           
            </div>

        </div>              

    </div>
}

export default AddCourse;