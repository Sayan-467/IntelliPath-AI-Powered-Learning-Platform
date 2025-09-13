import React from 'react'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link href="/" className="text-2xl font-bold text-blue-400 mb-4 block">
                            LearnPlatform
                        </Link>
                        <p className="text-gray-400">
                            Empowering learners worldwide with AI-powered education.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li><Link href="/courses" className="text-gray-400 hover:text-white">Browse Courses</Link></li>
                            <li><Link href="/instructors" className="text-gray-400 hover:text-white">Become Instructor</Link></li>
                            <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                            <li><Link href="/community" className="text-gray-400 hover:text-white">Community</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} LearnPlatform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
