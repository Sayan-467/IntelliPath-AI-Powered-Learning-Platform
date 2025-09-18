"use client"
import React from 'react'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { BookOpen, Users, BarChart3, Settings, Menu, X, LogOut, Home, PlusCircle, User, Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const NAVIGATION_ITEMS = {
  student: [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Progress' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  instructor: [
    { href: '/instructor', icon: Home, label: 'Dashboard' },
    { href: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/instructor/courses/create', icon: PlusCircle, label: 'Create Course' },
    { href: '/instructor/students', icon: Users, label: 'Students' },
    { href: '/instructor/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { href: '/admin', icon: Home, label: 'Admin Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/courses', icon: BookOpen, label: 'All Courses' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]
};

const dashboardLayout = () => {
    const {data: session, status} = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(0);

    useEffect(() => {
      if(status === 'loading') return
      if(!session) {
        router.push('/auth.signin')
        return
      }

      const userRole = session.user.role
      const isAdminRoute = pathname.startsWith('/admin')
      const isInstructorRoute = pathname.startsWith('/instructor')

      if(isAdminRoute && userRole !== 'admin') {
        router.push('/dashboard')
        return
      }
      if(isInstructorRoute && !['instructor', 'admin'].includes(userRole)) {
        router.push('/dashboard')
        return
      }
    }, [session, status, router])
    
    const handleSignOut = async () => {
        await signOut({redirect: false})
        router.push('/')
    }

    if(status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if(!session) return null
    const userRole = session.user.role || 'student'
    const navigationItems = NAVIGATION_ITEMS[userRole] || NAVIGATION_ITEMS.student

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    LearnPlatform
                </Link>
                <button
                    className="lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <X className="w-6 h-6" />
                </button>
                </div>

                {/* User info */}
                <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {session.user.image ? (
                        <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <User className="w-6 h-6 text-blue-600" />
                    )}
                    </div>
                    <div>
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                    </div>
                </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6">
                <ul className="space-y-1">
                    {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || 
                        (item.href !== '/' && pathname.startsWith(item.href));
                    
                    return (
                        <li key={item.href}>
                        <Link
                            href={item.href}
                            className={`
                            flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors
                            ${isActive 
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                        </li>
                    );
                    })}
                </ul>
                </nav>

                {/* Sign out */}
                <div className="absolute bottom-0 w-full p-6 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b">
                <div className="flex items-center justify-between h-16 px-6">
                    <button
                    className="lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                    >
                    <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-gray-500">
                        <Bell className="w-6 h-6" />
                        {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notifications}
                        </span>
                        )}
                    </button>

                    {/* User menu */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {session.user.image ? (
                            <img
                            src={session.user.image}
                            alt={session.user.name}
                            className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <User className="w-4 h-4 text-blue-600" />
                        )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">
                        {session.user.name}
                        </span>
                    </div>
                    </div>
                </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                <div className="p-6">
                    {children}
                </div>
                </main>
            </div>
            </div>
    )
}

export default dashboardLayout
