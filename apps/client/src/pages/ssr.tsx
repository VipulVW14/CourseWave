import { Button } from "ui";
import {signIn, useSession, signOut} from "next-auth/react"
import {getServerSession} from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export default function Ssr({session}) {
    return (
        <div style={{height: 60, background: "white", padding: 10}}>

            {session.user && <div style={{display: "flex", justifyContent: "space-between"}}>
                <h1 style={{color: "black"}}>
                    {session.user?.email}
                </h1>
                
                <div>
                    <Button variant={"contained"} onClick={() => signOut()}>Logout</Button>
                </div>
            </div>}

            {!session.user && <div style={{display: "flex", justifyContent: "space-between"}}>
                <h1 style={{color: "black"}}>
                    Coursera
                </h1>
                
                <div>
                    <Button type="Sign Up" onClick={() => signIn()}/> 
                </div>
            </div>}
        </div>
    )
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions)

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
        },
    }
}