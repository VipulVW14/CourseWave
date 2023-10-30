'use client'
import { useParams } from "next/navigation";
import {Button} from "ui";
import axios from "axios";
import { Course } from "store";

export default function Course({course}: {course: Course}){
    let params = useParams();
    console.log("this is courseId")
    console.log(params);

    return <div>
        <h1>hi from courseSsr</h1>
    </div>
}




  