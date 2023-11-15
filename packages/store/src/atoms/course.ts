import {atom} from "recoil";

export interface Course {
  id: string;
  title: string;
  description: string;
  imageLink: string;
  price: string;
}

export const courseState = atom({
  key: 'courseState',
  default: {
    isLoading: true,
    course: null
  },
});