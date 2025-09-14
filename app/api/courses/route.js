import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { Course, User } from '@/lib/models';
import { generateSlug } from '@/lib/utils';

// get all courses with filter 
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const search = searchParams.get('search');
        const instructorId = searchParams.get('instructorId');
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const skip = (page - 1) * limit;

        await connectDB();
        let filter = {}

        if (category && category !== 'all') filter.category = category
        if (level && level !== 'all') filter.level = level
        if (instructorId) filter.instructor = instructorId
        if (status) filter.status = status
        else filter.status = 'published' // only published courses for public
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ]
        }

        // get courses with pagination 
        const courses = await Course.find(filter)
            .populate('instructor', 'name email profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // get total count for pagination
        const totalCourses = await Course.countDocuments(filter);
        const totalPages = Math.ceil(totalCourses / limit)
        return NextResponse.json({
            courses,
            pagination: {
                currentPage: page,
                totalPages,
                totalCourses,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })
    } catch (error) {
        console.error("Error in fetching courses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await connectDB();
        const user = await User.findById(session.user.id)
        if (!user || !['instructor', 'admin'].includes(user.role)) {
            return NextResponse.json(
                { error: 'Only instructors can create courses' },
                { status: 403 }
            );
        }

        const { title, desc, shortDesc, category, level, pricing, content, tags, lang = 'English' } = await req.json()
        if (!title || !description || !category || !level) {
            return NextResponse.json(
                { error: 'Title, description, category, and level are required' },
                { status: 400 }
            );
        }

        // generate unique slug 
        let slug = generateSlug(title)
        let slugExists = await Course.findOne({ title })
        let counter = 1
        while (slugExists) {
            slug = `${generateSlug(title)}-${counter}`;
            slugExists = await Course.findOne({ slug });
            counter++;
        }

        // create course 
        const newCourse = await Course.create({
            title: title.trim(),
            slug,
            desc: desc.trim(),
            shortDesc: shortDesc?.trim(),
            instructor: session.user.id,
            category,
            level,
            lang,
            pricing: {
                type: pricing?.type || 'free',
                amount: pricing?.amount || 0,
                currency: pricing?.currency || 'USD',
            },
            content: {
                learningOutcomes: content?.learningOutcomes || [],
                requirements: content?.requirements || [],
                targetAudience: content?.targetAudience || [],
                totalDuration: 0,
                totalLessons: 0,
            },
            tags: tags || [],
            status: 'draft',
        })

        // Populate instructor info
        const populatedCourse = await Course.findById(newCourse._id)
            .populate('instructor', 'name email image');

        return NextResponse.json({
            message: 'Course created successfully',
            course: populatedCourse
        }, { status: 201 })
    } catch (err) {
        console.error("Error in creating courses:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}