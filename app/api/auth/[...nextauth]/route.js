import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db";
import { User } from "@/lib/models";

const authOptions = {
     providers: [
         GoogleProvider({
             clientId: process.env.GOOGLE_CLIENT_ID,
             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
             profile(profile) {
                 return {
                     id: profile.sub,
                     name: profile.name,
                     email: profile.email,
                     image: profile.picture,
                     role: "student"
                 }
             }
         }),
         GitHubProvider({
             clientId: process.env.GITHUB_CLIENT_ID,
             clientSecret: process.env.GITHUB_CLIENT_SECRET,
             profile(profile) {
                 return {
                     id: profile.sub,
                     name: profile.name,
                     email: profile.email,
                     image: profile.picture,
                     role: "student"
                 }
             }
         }),
         CredentialsProvider({
             name: 'credentials',
             credentials: {
                 email: { label: 'Email', type: 'email' },
                 password: { label: 'Password', type: 'password' },
             },
             async authorize(credentials) {
                 if (!credentials?.email || !credentials?.password) {
                     throw new Error('Invalid credentials');
                 }
 
                 await connectDB();
                 const user = await User.findOne({ email: credentials.email });
 
                 if (!user || !user.password) {
                     throw new Error('No user found');
                 }
                 const isPasswordValid = await bcrypt.compare(
                     credentials.password,
                     user.password
                 );
                 if (!isPasswordValid) {
                     throw new Error('Invalid password');
                 }
                 return {
                     id: user._id.toString(),
                     email: user.email,
                     name: user.name,
                     image: user.image,
                     role: user.role,
                 };
             },
         }),
     ],
     session: {
         strategy: "jwt",
         maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     jwt: {
         maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     callbacks: {
         async jwt({token, user, trigger, session}) {
             if(user) {
                 token.role = user.role
                 token.id = user.id
             }
             if(trigger === "update" && session) {
                 token.name = session.user.name
                 token.image = session.user.image 
             }
             return token
         },
         async session({session, token}) {
             if (token) {
                 session.user.id = token.id;
                 session.user.role = token.role;
             }
             return session
         },
         async signIn({user, acc, profile}) {
             if(acc?.provider !== "credentials") {
                 await connectDB()
                 const existingUser = await User.findOne({email: user.email})
                 if(!existingUser) {
                     await User.create({
                         name: user.name,
                         email: user.email,
                         image: user.image,
                         role: user.role || "student",
                         isEmailVerified: true
                     })
                 }
             }
             return true
         }
     },
     pages: {
         signIn: "/auth/signin",
         signUp: "/auth/signup",
         error: "/auth/error"
     },
     secret: process.env.NEXTAUTH_SECRET,
 }
 
 const handler = NextAuth(authOptions)
 export {handler as GET, handler as POST}