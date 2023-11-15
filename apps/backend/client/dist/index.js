"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCourse = exports.updateCourseById = exports.getCourseById = exports.getAllCourses = void 0;
const zeus_1 = require("./zeus");
const chain = (0, zeus_1.Chain)("http://localhost:8112/v1/graphql");
function getAllCourses() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield chain("query")({
                courses: [
                    {},
                    { id: true, title: true, description: true, imageLink: true, price: true }
                ]
            });
            console.log(response.courses);
            return response.courses;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    });
}
exports.getAllCourses = getAllCourses;
getAllCourses();
function getCourseById(courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield chain("query")({
                courses_by_pk: [
                    { id: courseId },
                    { id: true, title: true, description: true, imageLink: true, price: true },
                ],
            });
            return response.courses_by_pk;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.getCourseById = getCourseById;
// getCourseById("0ae1e008-cfa6-43f3-989d-b5b89cc87b2f");
function updateCourseById(courseId, updatedCourse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield chain("mutation")({
                update_courses_by_pk: [
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
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.updateCourseById = updateCourseById;
function addCourse(newCourse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield chain('mutation')({
                insert_courses_one: [{
                        object: newCourse
                    }, {
                        id: true,
                        title: true
                    }],
            });
            return response.insert_courses_one;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.addCourse = addCourse;
