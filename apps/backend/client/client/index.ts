import { Chain } from "./zeus";

const chain= Chain("http://localhost:8112/v1/graphql")

async function send(){
    try{
        const response = await chain("mutation")({
            insert_courses: [{
                input: {
                    title: "Title unpad hai",
                    description: "sahi me bhai",
                    imageLink: "https://pics,um.photos/200/300",
                    price: 999
                }
            }, {
                id: true,
                title: true
            }]
        })    
            console.log(response) 

    } catch(e) {
        console.log(e);
    }
}

send();