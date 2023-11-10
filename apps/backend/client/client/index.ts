import { Chain } from "./zeus";
const chain = Chain("http://localhost:8112/v1/graphql");

export async function getCoursesById(courseId: string) {
  try {
    const response = await chain("query")({
      courses_by_pk: [
        { id: courseId },
        { id: true, title: true, description: true, imageLink: true, price: true },
      ],
    });

    console.log(response.courses_by_pk);
  } catch (error) {
    console.error(error);
  }
}
getCoursesById("0ae1e008-cfa6-43f3-989d-b5b89cc87b2f");

export async function createCourse() {
  const response = await chain('mutation')({
    insert_courses_one: [{
      object:
        {
          title: 'adfasdf',
          description: 'adfasdf',
          imageLink: 'adsfa',
          price: 123
        } 
      }
    ],
  });
  console.log(response);  
}
createCourse();
