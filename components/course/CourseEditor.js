"use client"
import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {Button, Input, Label, Card, CardHeader, CardTitle, CardContent, LoadingSpinner} from "@/components/ui"
import { Plus, X, Edit, Trash2, Eye, EyeOff, Save, Upload, Play, FileText, DragHandleDots2Icon, Badge } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDuration } from '@/lib/utils';

const CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'other', label: 'Other' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Play },
  { value: 'text', label: 'Text', icon: FileText },
];

const CourseEditor = ({ courseId }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [course, setCourse] = useState(null)
    const [lessons, setlessons] = useState([])
    const [activeTab, setActiveTab] = useState('details')
    const [isAddingLesson, setIsAddingLesson] = useState(false)
    const [newLesson, setNewLesson] = useState({title: '', type: 'video', isFree: false})

    useEffect(() => {
      if(courseId) {
        fetchCourseData()
      }
    }, [courseId])
    
    const fetchCourseData = async() => {
        try {
            const res = await fetch(`/api/courses/${courseId}`)
            const data = await res.json()
            if(res.ok) {
                setCourse(data.course)
                setlessons(data.lessons || [])
            }
            else {
                toast.error(data.error || 'Failed to load course data')
                router.push('/instructor/courses')
            }
        } catch (err) {
            toast.error('Failed to load course data')
            router.push('/instructor/courses')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCourseUpdate = async(updateData) => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            })
            const data = await res.json()
            if(res.ok) {
                toast.success('Course updated successfully')
                setCourse(data.course)
            }
            else {
                toast.error(data.error || 'Failed to update course')
            }
        } catch (err) {
            toast.error('Failed to update course')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddLesson = async(e) => {
        e.preventDefault()
        if(!newLesson.title.trim()) {
            toast.error('Lesson title is required')
            return
        }   
        try {
            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLesson),
            })
            const data = await res.json()
            if(res.ok) {
                toast.success('Lesson added successfully')
                setlessons([...lessons, data.lesson])
                setNewLesson({title: '', type: 'video', isFree: false})
                setIsAddingLesson(false)
            }
            else {
                toast.error(data.error || 'Failed to add lesson')
            }
        } catch (err) {
            toast.error('Failed to add lesson')
        }
    }

    const handleDeleteLesson = async(lessonId) => {
        if(!confirm('Are you sure you want to delete this lesson?')) return 
        try {
            const res = await fetch(`/api/lessons/${lessonId}`, {
                method: 'DELETE',  
            })
            const data = await res.json()   
            if(res.ok) {
                toast.success('Lesson deleted successfully')
                setlessons(lessons.filter(lesson => lesson._id !== lessonId))
            } else {
                toast.error(data.error || 'Failed to delete lesson')
            }
        } catch (err) {
            toast.error('Failed to delete lesson')
        }
    }

    const handlePublishCourse = async() => {
        if(course.length === 0) {
            toast.error('Add at least one lesson before publishing')
            return
        }
        await handleCourseUpdate({
            status: course.status === 'published' ? 'draft' : 'published',
            publishedAt: course.status === 'published' ? null : new Date()
        })
    }

    if(isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if(!course) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Course not found</p>
            </div>
        )
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
            published: { label: 'Published', className: 'bg-green-100 text-green-800' },
            archived: { label: 'Archived', className: 'bg-yellow-100 text-yellow-800' },
        }
        const config = statusConfig[status] || statusConfig['draft']
        return <Badge className={config.className}>{config.label}</Badge>
    }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            {getStatusBadge(course.status)}
            <span className="text-sm text-gray-500">
              {lessons.length} lessons • {formatDuration(course.content?.totalDuration || 0)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/courses/${course.slug}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={handlePublishCourse}
            disabled={isSaving}
            variant={course.status === 'published' ? 'secondary' : 'default'}
          >
            {course.status === 'published' ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', label: 'Course Details' },
            { id: 'curriculum', label: 'Curriculum' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updateData = {
                title: formData.get('title'),
                description: formData.get('description'),
                shortDescription: formData.get('shortDescription'),
                category: formData.get('category'),
                level: formData.get('level'),
              };
              handleCourseUpdate(updateData);
            }} className="space-y-6">
              
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={course.title}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={course.shortDescription}
                  placeholder="Brief description for course cards"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={course.description}
                  required
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={course.category}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    name="level"
                    defaultValue={course.level}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Add Lesson Form */}
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAddingLesson ? (
                <Button onClick={() => setIsAddingLesson(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
              ) : (
                <form onSubmit={handleAddLesson} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="lessonTitle">Lesson Title</Label>
                      <Input
                        id="lessonTitle"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        placeholder="Enter lesson title"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lessonType">Type</Label>
                      <select
                        id="lessonType"
                        value={newLesson.type}
                        onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {LESSON_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lessonFree"
                      checked={newLesson.isFree}
                      onChange={(e) => setNewLesson({ ...newLesson, isFree: e.target.checked })}
                      className="mr-2"
                    />
                    <Label htmlFor="lessonFree">Make this lesson free (preview)</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button type="submit">Add Lesson</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsAddingLesson(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons ({lessons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No lessons added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const TypeIcon = LESSON_TYPES.find(t => t.value === lesson.type)?.icon || Play;
                    
                    return (
                      <div 
                        key={lesson._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500 font-mono w-8">
                            {index + 1}.
                          </span>
                          <TypeIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" size="sm">
                                {lesson.type}
                              </Badge>
                              {lesson.isFree && (
                                <Badge variant="success" size="sm">Free</Badge>
                              )}
                              {!lesson.isPublished && (
                                <Badge variant="warning" size="sm">Draft</Badge>
                              )}
                              {lesson.content?.duration && (
                                <span className="text-sm text-gray-500">
                                  {formatDuration(lesson.content.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/instructor/lessons/${lesson._id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Course Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pricing Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Pricing</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const pricingType = formData.get('pricingType');
                  const updateData = {
                    pricing: {
                      type: pricingType,
                      amount: pricingType === 'paid' ? parseFloat(formData.get('amount')) : 0,
                      currency: 'USD',
                    }
                  };
                  handleCourseUpdate(updateData);
                }} className="space-y-4">
                  
                  <div>
                    <Label>Pricing Type</Label>
                    <select
                      name="pricingType"
                      defaultValue={course.pricing?.type || 'free'}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Price (USD)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={course.pricing?.amount || 0}
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Update Pricing'
                    )}
                  </Button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete a course, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                        // Handle course deletion
                        fetch(`/api/courses/${courseId}`, { method: 'DELETE' })
                          .then(() => {
                            toast.success('Course deleted successfully');
                            router.push('/instructor/courses');
                          })
                          .catch(() => toast.error('Failed to delete course'));
                      }
                    }}
                  >
                    Delete Course
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CourseEditor
