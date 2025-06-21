import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Brain, 
  FileText, 
  CreditCard, 
  DollarSign, 
  Gift, 
  BarChart
} from 'lucide-react'

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, loading, token } = useAuth()
  const navigate = useNavigate()
  const API_BASE_URL = 'http://localhost:5000/api'

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [interviews, setInterviews] = useState([])
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // State for new plan/voucher creation
  const [newPlan, setNewPlan] = useState({
    name: '', price: '', duration_days: '', max_mock_interviews: '', max_cv_generations: '', max_business_cards: ''
  })
  const [newVoucher, setNewVoucher] = useState({
    code: '', percentage_discount: '', valid_from: '', valid_until: '', is_one_time_use: true
  })
  const [reportType, setReportType] = useState('user_activity')

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/') // Redirect to home or login if not admin
    }
    if (isAuthenticated && isAdmin) {
      fetchStats()
      fetchUsers()
      fetchSubscriptionPlans()
      fetchVouchers()
      fetchAllInterviews()
      fetchReports()
    }
  }, [isAuthenticated, isAdmin, loading, navigate])

  const fetchData = async (url, setter, errorMessage) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setter(data)
      } else {
        setError(errorMessage)
      }
    } catch (err) {
      setError(`Network error: ${errorMessage}`)
      console.error(err)
    }
  }

  const fetchStats = () => fetchData(`${API_BASE_URL}/admin/dashboard`, setStats, 'Failed to fetch dashboard stats.')
  const fetchUsers = () => fetchData(`${API_BASE_URL}/admin/users`, (data) => setUsers(data.users), 'Failed to fetch users.')
  const fetchSubscriptionPlans = () => fetchData(`${API_BASE_URL}/admin/subscription-plans`, (data) => setSubscriptionPlans(data.plans), 'Failed to fetch subscription plans.')
  const fetchVouchers = () => fetchData(`${API_BASE_URL}/admin/vouchers`, (data) => setVouchers(data.vouchers), 'Failed to fetch vouchers.')
  const fetchAllInterviews = () => fetchData(`${API_BASE_URL}/admin/interviews`, (data) => setInterviews(data.interviews), 'Failed to fetch all interviews.')
  const fetchReports = () => fetchData(`${API_BASE_URL}/admin/reports`, (data) => setReports(data.reports), 'Failed to fetch reports.')

  const handleCreatePlan = async () => {
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subscription-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPlan)
      })
      const data = await response.json()
      if (response.ok) {
        setSuccessMessage('Subscription plan created successfully!')
        setNewPlan({ name: '', price: '', duration_days: '', max_mock_interviews: '', max_cv_generations: '', max_business_cards: '' })
        fetchSubscriptionPlans()
      } else {
        setError(data.error || 'Failed to create subscription plan.')
      }
    } catch (err) {
      setError('Network error: Could not create subscription plan.')
      console.error(err)
    }
  }

  const handleCreateVoucher = async () => {
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVoucher)
      })
      const data = await response.json()
      if (response.ok) {
        setSuccessMessage('Voucher created successfully!')
        setNewVoucher({ code: '', percentage_discount: '', valid_from: '', valid_until: '', is_one_time_use: true })
        fetchVouchers()
      } else {
        setError(data.error || 'Failed to create voucher.')
      }
    } catch (err) {
      setError('Network error: Could not create voucher.')
      console.error(err)
    }
  }

  const handleGenerateReport = async () => {
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ report_type: reportType })
      })
      const data = await response.json()
      if (response.ok) {
        setSuccessMessage('Report generated successfully!')
        fetchReports()
      } else {
        setError(data.error || 'Failed to generate report.')
      }
    } catch (err) {
      setError('Network error: Could not generate report.')
      console.error(err)
    }
  }

  if (loading || !isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Loading Admin Panel...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users}</div>
            <p className="text-xs text-gray-500">{stats?.active_users} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Brain className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_interviews}</div>
            <p className="text-xs text-gray-500">{stats?.completed_interviews} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_cvs}</div>
            <p className="text-xs text-gray-500">Resumes created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_business_cards}</div>
            <p className="text-xs text-gray-500">Digital cards generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Manage Subscription Plans */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Subscription Plans</CardTitle>
          <CardDescription>Create and view subscription plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Plan Name" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} />
            <Input type="number" placeholder="Price" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} />
            <Input type="number" placeholder="Duration (days)" value={newPlan.duration_days} onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })} />
            <Input type="number" placeholder="Max Interviews" value={newPlan.max_mock_interviews} onChange={(e) => setNewPlan({ ...newPlan, max_mock_interviews: e.target.value })} />
            <Input type="number" placeholder="Max CVs" value={newPlan.max_cv_generations} onChange={(e) => setNewPlan({ ...newPlan, max_cv_generations: e.target.value })} />
            <Input type="number" placeholder="Max Business Cards" value={newPlan.max_business_cards} onChange={(e) => setNewPlan({ ...newPlan, max_business_cards: e.target.value })} />
          </div>
          <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">Create New Plan</Button>

          <h3 className="text-lg font-semibold mt-8 mb-4">Existing Plans</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Max Interviews</TableHead>
                <TableHead>Max CVs</TableHead>
                <TableHead>Max Cards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.price} {plan.currency}</TableCell>
                  <TableCell>{plan.duration_days} days</TableCell>
                  <TableCell>{plan.max_mock_interviews || 'Unlimited'}</TableCell>
                  <TableCell>{plan.max_cv_generations || 'Unlimited'}</TableCell>
                  <TableCell>{plan.max_business_cards || 'Unlimited'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manage Vouchers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Discount Vouchers</CardTitle>
          <CardDescription>Create and view discount vouchers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Voucher Code" value={newVoucher.code} onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })} />
            <Input type="number" placeholder="Discount %" value={newVoucher.percentage_discount} onChange={(e) => setNewVoucher({ ...newVoucher, percentage_discount: e.target.value })} />
            <div>
              <Label>Valid From</Label>
              <Input type="datetime-local" value={newVoucher.valid_from} onChange={(e) => setNewVoucher({ ...newVoucher, valid_from: e.target.value })} />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input type="datetime-local" value={newVoucher.valid_until} onChange={(e) => setNewVoucher({ ...newVoucher, valid_until: e.target.value })} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="oneTimeUse" checked={newVoucher.is_one_time_use} onChange={(e) => setNewVoucher({ ...newVoucher, is_one_time_use: e.target.checked })} />
              <Label htmlFor="oneTimeUse">One-Time Use</Label>
            </div>
          </div>
          <Button onClick={handleCreateVoucher} className="bg-green-600 hover:bg-green-700">Create New Voucher</Button>

          <h3 className="text-lg font-semibold mt-8 mb-4">Existing Vouchers</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>One-Time Use</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{voucher.code}</TableCell>
                  <TableCell>{voucher.percentage_discount}%</TableCell>
                  <TableCell>{new Date(voucher.valid_from).toLocaleString()}</TableCell>
                  <TableCell>{new Date(voucher.valid_until).toLocaleString()}</TableCell>
                  <TableCell>{voucher.is_one_time_use ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell>{userItem.id}</TableCell>
                  <TableCell>{userItem.username}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>{userItem.role}</TableCell>
                  <TableCell>{userItem.is_active ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>{new Date(userItem.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Interview Reports (Admin View) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Mock Interviews</CardTitle>
          <CardDescription>Overview of all mock interview sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interview ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>{interview.id}</TableCell>
                  <TableCell>{interview.user.username}</TableCell>
                  <TableCell>{interview.major}</TableCell>
                  <TableCell>{interview.language}</TableCell>
                  <TableCell>{interview.status}</TableCell>
                  <TableCell>{interview.overall_score?.toFixed(1) || 'N/A'}</TableCell>
                  <TableCell>{new Date(interview.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate and View Reports */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate & View Reports</CardTitle>
          <CardDescription>Generate various system reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Label htmlFor="reportType">Report Type</Label>
            <Select onValueChange={setReportType} value={reportType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_activity">User Activity</SelectItem>
                <SelectItem value="interview_summary">Interview Summary</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateReport} className="bg-purple-600 hover:bg-purple-700">
              <BarChart className="h-4 w-4 mr-2" /> Generate Report
            </Button>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-4">Generated Reports</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Generation Time</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.report_type}</TableCell>
                  <TableCell>{report.generated_by_user_id}</TableCell>
                  <TableCell>{new Date(report.generation_time).toLocaleString()}</TableCell>
                  <TableCell>
                    <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-auto max-h-24">
                      {JSON.stringify(report.report_data_json, null, 2)}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard

