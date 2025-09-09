import mongoose from "mongoose"

// user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
    profile: {
        bio: String,
        skills: [String],
        experience: String,
        socialLinks: {
            linkedin: String,
            github: String,
        }
    },
    preferences: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic'],
            default: 'visual'
        }
    },
    subscription: {
        plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
        status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
        startDate: Date,
        endDate: Date,
        stripeCustomerId: String,
        stripeSubscriptionId: String
    },
    isEmailVerified: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
}, { timestamps: true })

// course schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    thumbnail: String,
    trailer: String, // intro video URL
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['programming', 'design', 'business', 'marketing', 'data-science', 'other'],
        required: true
    },
    subcategory: String,
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    language: { type: String, default: 'English' },
    pricing: {
        type: { type: String, enum: ['free', 'paid'], required: true },
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
        discount: {
            percentage: Number,
            validUntil: Date
        }
    },
    content: {
        learningOutcomes: [String],
        requirements: [String],
        targetAudience: [String],
        totalDuration: Number, // in minutes
        totalLessons: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft'
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    enrollmentCount: { type: Number, default: 0 },
    tags: [String],
    isPublished: { type: Boolean, default: false },
    publishedAt: Date
}, { timestamps: true })

// lesson schema
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    order: { type: Number, required: true },
    type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'assignment'],
        default: 'video'
    },
    content: {
        videoUrl: String,
        videoId: String,
        duration: Number, // in seconds
        transcript: String,
        textContent: String,
        attachments: [{
            name: String,
            url: String,
            type: String,
            size: Number
        }]
    },
    isFree: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false }
}, { timestamps: true })

// Quiz Schema
const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    questions: [{
        question: { type: String, required: true },
        type: {
            type: String,
            enum: ['multiple-choice', 'true-false', 'fill-blank'],
            default: 'multiple-choice'
        },
        options: [String], // for multiple choice
        correctAnswer: String,
        explanation: String,
        points: { type: Number, default: 1 }
    }],
    timeLimit: Number, // in minutes
    passingScore: { type: Number, default: 70 }, // percentage
    attempts: { type: Number, default: 3 },
    randomizeQuestions: { type: Boolean, default: false }
}, {timestamps: true})

// Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrolledAt: { type: Date, default: Date.now },
    progress: {
        completedLessons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        }],
        currentLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        completionPercentage: { type: Number, default: 0 },
        totalTimeSpent: { type: Number, default: 0 }, // in minutes
        lastAccessed: { type: Date, default: Date.now }
    },
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: Date,
    rating: {
        score: Number, // 1-5
        review: String,
        ratedAt: Date
    }
}, { timestamps: true })

// Progress Tracking Schema
const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    watchTime: { type: Number, default: 0 }, // in seconds
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    notes: [{
        timestamp: Number, // video timestamp
        note: String,
        createdAt: { type: Date, default: Date.now }
    }],
    bookmarks: [{
        timestamp: Number,
        title: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

// Quiz Attempt Schema
const quizAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        timeSpent: Number // seconds
    }],
    score: Number, // percentage
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number, // total time in seconds
    isPassed: Boolean,
    attemptNumber: Number
}, { timestamps: true })

userSchema.index({email: 1})
courseSchema.index({instructor: 1, status: 1})
lessonSchema.index({category: 1, level: 1})
enrollmentSchema.index({student: 1, course: 1})
progressSchema.index({user: 1, course: 1})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
export const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema)
export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema)
export const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema)
export const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema)
export const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema)
