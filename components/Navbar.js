import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                LearnPlatform
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Courses
              </Link>
              <Link 
                href="/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
  )
}

export default Navbar
