"use client"
import React from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CourseEditor from '@/components/course/CourseEditor';
import { LoadingSpinner } from '@/components/ui';

const CourseEditPage = ({ params }) => {
    const {data: session, status} = useSession()
    const router = useRouter()
    const {courseId} = params

    useEffect(() => {
      if(status === 'loading') return
      if(!session) {
        router.push('/auth/signin')
        return
      }
      if(session?.user?.role !== 'instructor' && session?.user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }, [session, status, router])

    if(status === 'loading') {
        return (
            <div className='flex items-center justify-center h-96'>
                <LoadingSpinner size='lg' />
            </div>
        )
    }

    if(!session || (session?.user?.role !== 'instructor' && session?.user?.role !== 'admin')) {
        return null
    }

  return (
    <CourseEditor courseId={courseId} />
  )
}

export default CourseEditPage