import { Chain, ValueTypes } from "./zeus";
const chain = Chain("http://ec2-34-203-212-148.compute-1.amazonaws.com/v1/graphql");

export async function getAllCourses() {
  try{
    const response= await chain("query")({
      courses: [
        {},
        {id: true,title:true, description: true, imageLink: true, price: true}
      ]
    });
    return response.courses;
  }catch(error){
    console.log(error);
    return [];
  }
}

export async function getCourseById(courseId: string) {
  try {
    const response = await chain("query")({
      courses_by_pk: [
        { id: courseId },
        { id: true, title: true, description: true, imageLink: true, price: true },
      ],
    });
    return response.courses_by_pk;
  } catch (error) {
    console.error(error);
  }
}

export async function updateCourseById(courseId: string, updatedCourse: ValueTypes["courses_set_input"]) {
  try{
    const response= await chain("mutation")({
      update_courses_by_pk:[
        {
          pk_columns: { id: courseId },
          _set: updatedCourse,
        },
        {
          id: true,
          title: true,
          description: true,
          imageLink: true,
          price: true
        } 
      ]
    });
    return response.update_courses_by_pk;
  }catch(error){
    console.log(error);
  }
}

export async function addCourse(newCourse: ValueTypes["courses_set_input"]) {
  try{
    const response = await chain('mutation')({
      insert_courses_one: [{
        object: newCourse
      },{
        id: true,
        title: true
      }],
    });
    return response.insert_courses_one;
  }catch(error){
    console.log(error);
  }  
}
