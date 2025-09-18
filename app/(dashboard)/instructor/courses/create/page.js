import React from 'react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import courseCreator from '@/components/course/CourseCreator'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/ui'

const createCoursePage = () => {
    const {data: session, status} = useSession()
    const router = useRouter()

    useEffect(() => {
        if(status === 'loading') return
        if(!session) {
            router.push('/auth/signin')
            return
        }

        if(!['instructor', 'admin'].includes(session.user.role)) {
            router.push('/dashboard')
            return
        }
    }, [session, status, router])
    
    if(status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        )            
    }
    if(!session || !['instructor', 'admin'].includes(session.user.role)) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-600 mt-2">
          Share your knowledge with students around the world
        </p>
      </div>

      <courseCreator />
    </div>
  )
}

export default createCoursePage
