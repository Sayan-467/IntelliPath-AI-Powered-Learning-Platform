import mongoose from "mongoose"

if(!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables")
}

let cached = global.mongoose
if(!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

const connectDB = async() => {
    if(cached.conn) {
        return cached.conn
    }

    if(!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
        }

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("Connected to MongoDB")
            return mongoose
        }).catch((err) => {
            console.error("MongoDB connection error:", err)
            throw err
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (err) {
        cached.promise = null
        throw err
    }
    return cached.conn
}

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB")
})

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected from DB")
})

export default connectDB