import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { Lesson, Course, User } from '@/lib/models';
import { generateSlug } from '@/lib/utils';

export async function GET(req, {params}) { 
    try {
        const {lessonId} = params
        await connectDB()
        const lesson = await Lesson.findOne({$or: [{_id: lessonId}, {slug: lessonId}]})
            .populate('course', 'title slug')
        if(!lesson) {
            return NextResponse.json({error: 'Lesson not found'}, {status: 404})
        }
        return NextResponse.json({lesson}, {status: 200})
    } catch (err) {
        console.error('Error fetching lesson:', err)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}

export async function PUT(req, {params}) {
    try {
        const session = await getServerSession()
        const {lessonId} = params
        if(!session?.user) {
            return NextResponse.json({error: 'Authentication required'}, {status: 401})
        }
        await connectDB()

        const lesson = await Lesson.findById(lessonId).populate('course')
        if(!lesson) {
            return NextResponse.json({error: 'Lesson not found'}, {status: 404})
        }
        const user = await User.findById(session.user.id)
        if(lesson.course.instructor.toString() !== session.user.id && user.role !== 'admin') {
            return NextResponse.json({error: 'Unauthorized'}, {status: 403})
        }

        const updateData = await req.json()
        if(updateData.title && updateData.title !== lesson.title) {
            let newSlug = generateSlug(updateData.title)
            const slugExists = await Lesson.findOne({slug: newSlug, course: lesson.course._id, _id: {$ne: lessonId}})
            let counter = 1
            while (slugExists) {
                newSlug = `${generateSlug(updateData.title)}-${counter}`;
                slugExists = await Lesson.findOne({ 
                slug: newSlug, 
                course: lesson.course._id,
                _id: { $ne: lessonId } 
                });
                counter++;
            }
            updateData.slug = newSlug
        }

        const oldDuration = lesson.content?.duration || 0
        const newDuration = updateData.content?.duration || oldDuration
        const durationDiff = newDuration-oldDuration

        if(durationDiff !== 0) {
            await Course.findByIdAndUpdate(lesson.course._id, {
                $inc: {'content.totalDuration': durationDiff}
            })
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, 
            {...updateData, updatedAt: new Date()},
            {new: true, runValidators: true}
        ).populate('course', 'title instructor')
        
        return NextResponse.json({message: 'Lesson updated successfully', lesson: updatedLesson})
    } catch (err) {
        console.error('Error updating lesson:', err)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}

export async function DELETE(req, {params}) {
    try {
        const session = await getServerSession();
        const { lessonId } = params;
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        await connectDB();
        const lesson = await Lesson.findById(lessonId).populate('course');
        if (!lesson) {
            return NextResponse.json(
                { error: 'Lesson not found' },
                { status: 404 }
            )
        }

        const user = await User.findById(session.user.id);
        if (lesson.course.instructor.toString() !== session.user.id && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'You can only delete lessons from your own courses' },
                { status: 403 }
            )
        }
        await Course.findByIdAndUpdate(lesson.course._id, {
            $inc: { 
                'content.totalLessons': -1,
                'content.totalDuration': -(lesson.content?.duration || 0)
            }
        })
        await Lesson.findByIdAndDelete(lessonId);
        return NextResponse.json({
            message: 'Lesson deleted successfully'
        })
    } catch (err) {
        console.error('Error deleting messages')
        return NextResponse.json({error: 'Failed to delete lesson'}, {error: 500})
    }
}