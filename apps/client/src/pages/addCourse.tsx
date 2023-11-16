import {Button, GrayTopper} from "ui";
import {useState} from "react";
import { addCourse } from "../../../backend/client/client"
import {signIn, useSession, signOut} from "next-auth/react"



function AddCourse() {
    const session = useSession();

    const [title, setTitle] = useState("Title");
    const [description, setDescription] = useState("Description");
    const [image, setImage] = useState("https://picsum.photos/400/230");
    const [price, setPrice] = useState<number>(0);

    return <div className="">

        {session.data && <div>
            <GrayTopper text="Add Course"/>
            <div className="p-10 flex flex-wrap justify-around w-full h-screen bg-slate-100">

                <div className="max-w-md ">
                    <h1 className="text-3xl mb-3 mt-6">Course Preview</h1>
                    <div className="bg-white shadow-xl rounded-lg m-5">
                        <img src={image} className="rounded-t-lg" ></img>
                        <div className="m-2 ml-4 pb-2 leading-7">
                            <p className="text-lg font-bold">{title}</p>
                            <p className="font-light">{description}</p>
                            <p className="font-medium">Rs. {price}</p>
                        </div>       
                    </div>           
                </div>

                <div className="mt-12">
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
                        <input onChange={(e) => { setImage(e.target.value) }} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="imagelink" type="url" placeholder="https://picsum.photos/400/230"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                        Price          
                        </label>
                        <input onChange={(e) => { setPrice(parseInt(e.target.value)) }} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="price" type="number" placeholder="0"/>
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

                            alert("Course Added!");
                        }}
                        className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Add Course
                        </button>
                    </div>
                    </form>  
                </div>   

                
                

            </div>
        </div>}

        {!session.data && <div className="mt-12 flex flex-wrap justify-center">
                <p className="text-4xl mb-3">You are logged out!</p>
                <Button text="Signin" onClick={() => signIn()}/>
            </div>
        }         

    </div>
}

export default AddCourse;