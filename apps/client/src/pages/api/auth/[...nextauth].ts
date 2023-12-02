import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import {Provider} from "next-auth/providers/index"
import { ZodError, z } from 'zod';
import { createUser, signinUser } from "../../../../../backend/client/client"

//Zod Schema
const credentialsSchema= z.object({
    username: z.string().min(4).max(20),
    password: z.string().min(4).max(20),
});

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || '',
        }),
        
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            type: "credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password", placeholder: "*****" }
            },
            async authorize(credentials, req) {
                try{
                    const validatedCredentials= credentialsSchema.parse(credentials);

                    const username = validatedCredentials.username;
                    const password = validatedCredentials.password;
                    
                    console.log(username+""+password);
                    const user = await signinUser(username,password);
            
                    if (!user) {
                        const obj = { username: username, password: password };
                        const newUser = await createUser(username,password)

                        return {
                            id: '1',
                            name: username,
                        }
                    } 
                    else {
                        return {
                            id: '1',
                            name: username,
                        }
                    }

                }catch(error:any) {
                    if(error instanceof ZodError){
                       //Handle invalid credentials
                       return null; 
                    }
                    throw error;
                }
            }   
        }),
    ] as Provider[],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    theme: {
        colorScheme: "auto", // "auto" | "dark" | "light"
        brandColor: "", // Hex color value
        logo: "https://i.postimg.cc/150cbgMM/Blue-White-Simple-Modern-Course-Logo-2.png" // Absolute URL to logo image
    }
}

export default NextAuth(authOptions);



