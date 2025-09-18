"use client"
import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from '@/components/ui'
import {toast} from 'react-hot-toast'
import { Plus, X } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'other', label: 'Other' },
]

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const PRICING_TYPES = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
]

const courseCreator = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        shortDesc: '',
        category: 'programming',
        level: 'beginner',
        labguage: 'English',
        pricing: { type: 'free', amount: 0 },
        content: {
            learningOutcomes: [''],
            requirements: [''],
            targetAudience: [''],
        },
        tags: ['']
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target
        if(name.includes('.')) {
            const [parent, child] = name.split('.')
            setFormData((prev) => ({...prev, [parent]: {...prev[parent], [child]: value}
            }))
        }
        else {
            setFormData((prev) => ({
                ...prev, [name]: value
            }))
        }
    }

    const handleArrayChange = (section, index, value) => {
        setFormData(prev => ({
            ...prev,
            content: {
                ...prev.content, [section]: prev.content[section].map((item, i) => i === index ? value : item
                ),
            },
        }))
    }

    const handleTagChange = (index, value) => {
        setFormData((prev) => ({
            ...prev, tags: prev.tags.map((tag, i) => i === index ? value : tag)
        }))
    }

    const addArrayItem = async(e) => {
        if(section === 'tags') {
            setFormData((prev) => ({
                ...prev, tags: [...prev.tags, '']
            }))
        }
        else {
            setFormData((prev) => ({
                ...prev, content: {
                    ...prev.content, [section]: [...prev.content[section], '']
                }
            }))
        }
    }

    const removeArrayItem = (section, index) => {
      if (section === 'tags') {
        setFormData(prev => ({
          ...prev,
          tags: prev.tags.filter((_, i) => i !== index),
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          content: {
            ...prev.content,
            [section]: prev.content[section].filter((_, i) => i !== index),
          },
        }));
      }
    }

    const handleSubmit = async(e) => {
      e.preventDefault()
      isLoading(true)

      const cleanedData = {
        ...formData,
        content: {
          learningOutcomes: formData.content.learningOutcomes.filter(item => item.trim()),
          requirements: formData.content.requirements.filter(item => item.trim()),
          targetAudience: formData.content.targetAudience.filter(item => item.trim()),
        },
        tags: formData.tags.filter(tag => tag.trim())
      }

      try {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedData),
        })
        const data = await res.json()
        if(!res.ok) {
          throw new Error(data.message || 'Something went wrong')
        }
        toast.success("Course created successfully")
        router.push(`/instructor/courses/${data.course._id}`)
      } catch (err) {
        toast.error("Something went wrong. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <p className="text-gray-600">Fill out the information below to create your course</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter course title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief description for course cards"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed course description"
                  required
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
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
                  <Label htmlFor="level">Level *</Label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
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

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="English"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricing.type">Pricing Type *</Label>
                  <select
                    id="pricing.type"
                    name="pricing.type"
                    value={formData.pricing.type}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PRICING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.pricing.type === 'paid' && (
                  <div>
                    <Label htmlFor="pricing.amount">Price (USD) *</Label>
                    <Input
                      id="pricing.amount"
                      name="pricing.amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.amount}
                      onChange={handleInputChange}
                      placeholder="49.99"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learning Outcomes</h3>
              <p className="text-sm text-gray-600">What will students learn from this course?</p>
              
              {formData.content.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                    placeholder="Students will be able to..."
                    className="flex-1"
                  />
                  {formData.content.learningOutcomes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('learningOutcomes', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('learningOutcomes')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Learning Outcome
              </Button>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <p className="text-sm text-gray-600">What do students need before taking this course?</p>
              
              {formData.content.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    placeholder="Basic knowledge of..."
                    className="flex-1"
                  />
                  {formData.content.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('requirements')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Target Audience</h3>
              <p className="text-sm text-gray-600">Who is this course for?</p>
              
              {formData.content.targetAudience.map((audience, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={audience}
                    onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                    placeholder="Beginners who want to learn..."
                    className="flex-1"
                  />
                  {formData.content.targetAudience.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('targetAudience', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('targetAudience')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Target Audience
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <p className="text-sm text-gray-600">Help students find your course with relevant tags</p>
              
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="javascript, react, web development..."
                    className="flex-1"
                  />
                  {formData.tags.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('tags', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('tags')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default courseCreator
