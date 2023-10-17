import { Button} from "ui";
import { useRouter } from "next/router";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { userState, isUserLoading, userEmailState } from "store";

function Appbar({}) {
    const router = useRouter();
    const userLoading = useRecoilValue(isUserLoading);
    const userEmail = useRecoilValue(userEmailState);
    const setUser = useSetRecoilState(userState);

    if (userLoading) {
        return <></>
    }

    if (userEmail) {
        return <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 4,
            zIndex: 1
        }}>
            <div style={{marginLeft: 10, cursor: "pointer"}} onClick={() => {
                router.push("/")
            }}>
                <h1>CourseWave</h1>
            </div>
    
            <div style={{display: "flex"}}>

                <div style={{marginRight: 10, display: "flex"}}>
                    <div style={{marginRight: 10}}>
                        <Button
                            onClick={() => {
                                router.push("/addcourse")
                            }}
                            text="Add course"
                        />
                    </div>

                    <div style={{marginRight: 10}}>
                        <Button
                            onClick={() => {
                                router.push("/courses")
                            }}
                            text="Courses"
                        />
                    </div>

                    <Button
                        onClick={() => {
                            localStorage.setItem("token", "");
                            setUser({
                                isLoading: false,
                                userEmail: null
                            })
                        }}
                        text="Logout"
                    />
                </div>
                
            </div>
        </div>
    } else {
        return <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 4,
            zIndex: 1
        }}>
            <div style={{marginLeft: 10, cursor: "pointer"}} onClick={() => {
                router.push("/")
            }}>
                <h1>Coursera</h1>
            </div>
    
            <div style={{display: "flex"}}>

                <div style={{marginRight: 10}}>
                    <Button
                        variant={"contained"}
                        onClick={() => {
                            router.push("/signup")
                        }}
                        text="Signup"
                    />
                </div>

                <div>
                    <Button
                        variant={"contained"}
                        onClick={() => {
                            router.push("/signin")
                        }}
                        text="Signin"
                    />
                </div>
                
            </div>
        </div>
    }
}

export default Appbar;