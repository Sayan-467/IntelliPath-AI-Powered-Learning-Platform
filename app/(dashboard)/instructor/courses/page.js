import React from 'react'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, LoadingSpinner, Badge } from '@/components/ui';
import { Plus, Edit, Eye, Trash2, MoreHorizontal, BookOpen, Users, DollarSign, Calendar} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate, formatCurrency, getCategoryColor, getLevelColor } from '@/lib/utils';

const instructorCoursePage = () => {
    const {data:session, status} = useSession()
    const router = useRouter()
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(null)

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
      fetchCourses()
    }, [session, status, router])
    
    const fetchCourses = async() => {
        try {
            const res = await fetch(`/api/courses?instructor=${session.user.id}&status=all`)
            const data = await res.json()
            if(res.ok) {
                setCourses(data.courses || [])
            }
            else {
                toast.error('Failed to load courses')
            }
        } catch (err) {
            toast.error('Failed to load courses')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteCourse = async(courseId) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

        setIsDeleting(courseId);
        
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCourses(courses.filter(course => course._id !== courseId));
                toast.success('Course deleted successfully');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete course');
            }
        } catch (error) {
            toast.error('Error deleting course');
        } finally {
            setIsDeleting(null);
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { label: 'Draft', variant: 'secondary' },
            review: { label: 'Under Review', variant: 'warning' },
            published: { label: 'Published', variant: 'success' },
            archived: { label: 'Archived', variant: 'error' },
        }
        const config = statusConfig[status] || statusConfig.draft
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    if(status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        )
    }
    
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">
            Manage your courses and track their performance
          </p>
        </div>
        <Link href="/instructor/courses/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.status === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    courses.reduce((sum, c) => 
                      sum + ((c.pricing?.amount || 0) * (c.enrollmentCount || 0)), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first course to start teaching and earning
            </p>
            <Link href="/instructor/courses/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Course Image Placeholder */}
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Course Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    {getStatusBadge(course.status)}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(course.category)}>
                      {course.category}
                    </Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrollmentCount || 0} students
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(course.createdAt)}
                    </div>
                  </div>

                  {course.pricing?.type === 'paid' && (
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(course.pricing.amount)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Link href={`/instructor/courses/${course._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>

                  <div className="flex items-center space-x-2">
                    <Link href={`/courses/${course.slug}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course._id)}
                      disabled={isDeleting === course._id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isDeleting === course._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default instructorCoursePage
