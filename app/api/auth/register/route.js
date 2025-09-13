import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { isValidEmail } from "@/lib/utils";
import bcrypt from 'bcryptjs'
import { User } from "@/lib/models";

export async function POST(req) {
    try {
        const {name, email, password, role='student'} = await req.json()
        if(!name || !email || !password) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400})
        }
        if(!isValidEmail) {
            return NextResponse.json({error: "Invalid email"}, {status: 400})
        }
        if(password.length < 6) {
            return NextResponse.json({error: "Password must be at least 6 characters"}, {status: 400})
        }
        if(!['student', 'instructor'].includes(role)) {
            return NextResponse.json({error: "Invalid role"}, {status: 400})
        }

        await connectDB()
        const existingUser = await User.findOne({email: email.toLowerCase()})
        if(existingUser) {
            return NextResponse.json({error: "Email already in use"}, {status: 400})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User.create({
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role,
            isEmailVerified: false
        })
        const userRes = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email, 
            role: newUser.role,
            createdAt: newUser.createdAt
        }

        return NextResponse.json({message: "User registered successfully", user: userRes}, {status: 201})
    } catch (err) {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}