import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { Course, User, Lesson } from '@/lib/models';
import { generateSlug } from '@/lib/utils';

// get single course 
export async function GET(req, { params }) {
    try {
        const { courseId } = params
        await connectDB()

        const course = await Course.findOne({ $or: [{ _id: courseId }, { slug: courseId }] })
            .populate('instructor', 'name email profileImage bio')
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const lessons = await Lession.find({ course: course._id }).sort({ order: 1 })
        return NextResponse.json({ course, lessons })
    } catch (err) {
        console.error('Error fetching course:', err);
        return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
    }
}

// update the course
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession();
        const { courseId } = params;

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await connectDB();
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        const user = await User.findById(session.user.id);
        if (course.instructor.toString() !== session.user.id && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'You can only edit your own courses' },
                { status: 403 }
            );
        }

        const updateData = await request.json();
        if (updateData.title && updateData.title !== course.title) {
            let newSlug = generateSlug(updateData.title);
            let slugExists = await Course.findOne({
                slug: newSlug,
                _id: { $ne: courseId }
            });
            let counter = 1;

            while (slugExists) {
                newSlug = `${generateSlug(updateData.title)}-${counter}`;
                slugExists = await Course.findOne({
                    slug: newSlug,
                    _id: { $ne: courseId }
                });
                counter++;
            }
            updateData.slug = newSlug;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('instructor', 'name email image');

        return NextResponse.json({
            message: 'Course updated successfully',
            course: updatedCourse
        })
    } catch (err) {
        console.error("Error updating course:", err);
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
    }
}

// delete a course
export async function DELETE(req, {params}) {
    try {
        const session = await getServerSession();
        const { courseId } = params;

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await connectDB();
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // check if user owns the course or is admin
        const user = await User.findById(session.user.id)
        if(course.instructor.toString() !== session.user.id && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'You can only delete your own courses' },
                { status: 403 }
            )
        }

        // delete all lessons of that course
        await Lesson.deleteMany({course: course._id})
        await Course.findByIdAndDelete(course._id)
        return NextResponse.json({ message: "Course deleted successfully" })
    } catch (err) {
        console.error("Error deleting course:", err);
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
    }
}