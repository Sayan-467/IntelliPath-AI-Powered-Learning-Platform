import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { Lesson, Course, User } from '@/lib/models';
import { generateSlug } from '@/lib/utils';

// get lessons for a course
export async function GET(req) { 
    try {
        const { searchParams } = new URL(req.url)
        const courseId = searchParams.get('courseId')

        if(!courseId) {
            return NextResponse.json({error: 'Course ID is required'}, {status: 400})
        }
        await connectDB()
        const lessons = await Lesson.find({course: courseId})
            .sort({createdAt: 1})
            .select('title slug free preview videoUrl createdAt updatedAt')
        return NextResponse.json({lessons}, {status: 200})
    } catch (err) {
        console.error('Error fetching lessons:', err)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}

// create new lesson
export async function POST(req) {
    try {
        const session = await getServerSession();
        
        if (!session?.user) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        )
    }

    await connectDB();
    const { title, courseId, type = 'video', content = {}, isFree = false, order} = await request.json();

    // Validation
    if (!title || !courseId) {
      return NextResponse.json(
        { error: 'Title and course ID are required' },
        { status: 400 }
      );
    }

    // Check if course exists and user owns it
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
        { error: 'You can only add lessons to your own courses' },
        { status: 403 }
      );
    }

    // Generate slug
    let slug = generateSlug(title);
    let slugExists = await Lesson.findOne({ slug, course: courseId });
    let counter = 1
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Lesson.findOne({ slug, course: courseId });
      counter++;
    }

    // Determine order if not provided
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const lastLesson = await Lesson.findOne({ course: courseId })
        .sort({ order: -1 });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
    }

    // Create lesson
    const newLesson = await Lesson.create({
      title: title.trim(),
      slug,
      course: courseId,
      order: lessonOrder,
      type,
      content: {
        videoUrl: content.videoUrl || '',
        videoId: content.videoId || '',
        duration: content.duration || 0,
        transcript: content.transcript || '',
        textContent: content.textContent || '',
        attachments: content.attachments || [],
      },
      isFree,
      isPublished: false,
    });

    // Update course lesson count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { 'content.totalLessons': 1 }
    });
    return NextResponse.json(
      { 
        message: 'Lesson created successfully',
        lesson: newLesson 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}