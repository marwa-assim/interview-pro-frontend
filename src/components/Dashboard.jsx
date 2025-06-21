import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Brain, 
  FileText, 
  CreditCard, 
  User, 
  Settings, 
  LogOut, 
  Crown
} from 'lucide-react'

const Dashboard = () => {
  const { user, logout, isAuthenticated, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InterviewPro</span>
          </div>
          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/interview" className="flex items-center space-x-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <Brain className="h-5 w-5" />
              <span>Mock Interview</span>
            </Link>
            <Link to="/cv-builder" className="flex items-center space-x-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <FileText className="h-5 w-5" />
              <span>CV Builder</span>
            </Link>
            <Link to="/business-cards" className="flex items-center space-x-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <CreditCard className="h-5 w-5" />
              <span>Business Cards</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-md text-purple-700 hover:bg-purple-100 transition-colors">
                <Crown className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>
        <div className="space-y-2">
          <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
          <Button onClick={logout} className="w-full flex items-center space-x-3 p-3 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome, {user?.first_name || user?.username}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mock Interviews</CardTitle>
              <Brain className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.mock_interviews?.length || 0}</div>
              <p className="text-xs text-gray-500">Practice makes perfect!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CVs Created</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.cvs?.length || 0}</div>
              <p className="text-xs text-gray-500">Build your professional resume</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Digital Business Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.business_cards?.length || 0}</div>
              <p className="text-xs text-gray-500">Network with ease</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profile_picture_url} alt="User Avatar" />
                <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">Major: {user?.major || 'N/A'}</p>
                <p className="text-gray-600">Role: {user?.role}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link to="/interview">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Start Mock Interview
                </Button>
              </Link>
              <Link to="/cv-builder">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Build Your CV
                </Button>
              </Link>
              <Link to="/business-cards">
                <Button className="w-full bg-purple-500 hover:bg-purple-600">
                  Create Business Card
                </Button>
              </Link>
              <Link to="/profile">
                <Button className="w-full bg-gray-500 hover:bg-gray-600">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

