import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Trash2, Download, FileText, CheckCircle } from 'lucide-react'

const CVBuilder = () => {
  const { user, isAuthenticated, loading, token } = useAuth()
  const navigate = useNavigate()
  const API_BASE_URL = 'http://localhost:5000/api'

  const [cvTemplates, setCvTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [cvData, setCvData] = useState(null)
  const [cvTitle, setCvTitle] = useState('My New CV')
  const [cvLanguage, setCvLanguage] = useState('en')
  const [userCvs, setUserCvs] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
    fetchCVTemplates()
    fetchUserCVs()
    fetchSampleCVData()
  }, [isAuthenticated, loading, navigate])

  const fetchCVTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv/templates`)
      if (response.ok) {
        const data = await response.json()
        setCvTemplates(data.templates)
      } else {
        setError('Failed to fetch CV templates.')
      }
    } catch (err) {
      setError('Network error: Could not connect to API.')
      console.error(err)
    }
  }

  const fetchUserCVs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserCvs(data.cvs)
      } else {
        setError('Failed to fetch user CVs.')
      }
    } catch (err) {
      setError('Network error: Could not fetch user CVs.')
      console.error(err)
    }
  }

  const fetchSampleCVData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cv/sample-data`)
      if (response.ok) {
        const data = await response.json()
        setCvData(data.sample_data)
      } else {
        setError('Failed to fetch sample CV data.')
      }
    } catch (err) {
      setError('Network error: Could not fetch sample CV data.')
      console.error(err)
    }
  }

  const handleInputChange = (section, field, value, index = null) => {
    setCvData(prevData => {
      const newData = { ...prevData }
      if (index !== null && Array.isArray(newData[section])) {
        newData[section][index] = { ...newData[section][index], [field]: value }
      } else if (typeof newData[section] === 'object' && newData[section] !== null) {
        newData[section] = { ...newData[section], [field]: value }
      } else {
        newData[section] = value
      }
      return newData
    })
  }

  const handleArrayItemChange = (section, index, field, value) => {
    setCvData(prevData => {
      const newData = { ...prevData }
      newData[section] = newData[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
      return newData
    })
  }

  const addArrayItem = (section, defaultItem) => {
    setCvData(prevData => ({
      ...prevData,
      [section]: [...prevData[section], defaultItem]
    }))
  }

  const removeArrayItem = (section, index) => {
    setCvData(prevData => ({
      ...prevData,
      [section]: prevData[section].filter((_, i) => i !== index)
    }))
  }

  const handleSkillChange = (type, index, value) => {
    setCvData(prevData => {
      const newSkills = { ...prevData.skills }
      newSkills[type][index] = value
      return { ...prevData, skills: newSkills }
    })
  }

  const addSkill = (type) => {
    setCvData(prevData => {
      const newSkills = { ...prevData.skills }
      newSkills[type] = [...newSkills[type], '']
      return { ...prevData, skills: newSkills }
    })
  }

  const removeSkill = (type, index) => {
    setCvData(prevData => {
      const newSkills = { ...prevData.skills }
      newSkills[type] = newSkills[type].filter((_, i) => i !== index)
      return { ...prevData, skills: newSkills }
    })
  }

  const createCV = async () => {
    setError(null)
    setSuccessMessage(null)
    if (!selectedTemplate || !cvData || !cvTitle || !cvLanguage) {
      setError('Please fill all required fields: Template, Title, Language, and CV Data.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cv/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template_id: selectedTemplate,
          language: cvLanguage,
          cv_data: cvData,
          title: cvTitle
        })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccessMessage('CV created successfully!')
        fetchUserCVs()
      } else {
        setError(data.error || 'Failed to create CV.')
      }
    } catch (err) {
      setError('Network error: Could not create CV.')
      console.error(err)
    }
  }

  const generatePdf = async (cvId) => {
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/cv/${cvId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setSuccessMessage('PDF generated successfully! You can download it now.')
        // In a real app, you'd trigger a download or open a new tab
        console.log('Generated PDF URL:', data.pdf_url)
        // For now, we'll just update the user's CV list to reflect the new PDF URL
        fetchUserCVs()
      } else {
        setError(data.error || 'Failed to generate PDF.')
      }
    } catch (err) {
      setError('Network error: Could not generate PDF.')
      console.error(err)
    }
  }

  const deleteCV = async (cvId) => {
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/cv/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccessMessage('CV deleted successfully!')
        fetchUserCVs()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete CV.')
      }
    } catch (err) {
      setError('Network error: Could not delete CV.')
      console.error(err)
    }
  }

  if (loading || !cvData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">CV Builder</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CV Form */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create/Edit Your CV</CardTitle>
              <CardDescription>Fill in your details to build your professional resume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="cvTitle">CV Title</Label>
                <Input
                  id="cvTitle"
                  type="text"
                  value={cvTitle}
                  onChange={(e) => setCvTitle(e.target.value)}
                  placeholder="e.g., Software Engineer CV"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvLanguage">Language</Label>
                <Select onValueChange={setCvLanguage} value={cvLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template">Choose Template</Label>
                <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a CV template" />
                  </SelectTrigger>
                  <SelectContent>
                    {cvTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} {template.is_premium && '(Premium)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Info */}
              <Card className="bg-gray-50">
                <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={cvData.personal_info.full_name} onChange={(e) => handleInputChange('personal_info', 'full_name', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={cvData.personal_info.email} onChange={(e) => handleInputChange('personal_info', 'email', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={cvData.personal_info.phone} onChange={(e) => handleInputChange('personal_info', 'phone', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={cvData.personal_info.address} onChange={(e) => handleInputChange('personal_info', 'address', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input id="linkedin" value={cvData.personal_info.linkedin} onChange={(e) => handleInputChange('personal_info', 'linkedin', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="website">Personal Website</Label>
                    <Input id="website" value={cvData.personal_info.website} onChange={(e) => handleInputChange('personal_info', 'website', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="photoUrl">Photo URL</Label>
                    <Input id="photoUrl" value={cvData.personal_info.photo_url} onChange={(e) => handleInputChange('personal_info', 'photo_url', e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Summary */}
              <Card className="bg-gray-50">
                <CardHeader><CardTitle className="text-lg">Professional Summary</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={cvData.professional_summary} onChange={(e) => handleInputChange('professional_summary', null, e.target.value)} rows={5} />
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Experience</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('experience', { job_title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.experience.map((exp, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-2 relative">
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeArrayItem('experience', index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <div>
                        <Label>Job Title</Label>
                        <Input value={exp.job_title} onChange={(e) => handleArrayItemChange('experience', index, 'job_title', e.target.value)} />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input value={exp.company} onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)} />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={exp.location} onChange={(e) => handleArrayItemChange('experience', index, 'location', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input type="month" value={exp.start_date} onChange={(e) => handleArrayItemChange('experience', index, 'start_date', e.target.value)} />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input type="month" value={exp.end_date} onChange={(e) => handleArrayItemChange('experience', index, 'end_date', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={exp.description} onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)} rows={3} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Education</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('education', { degree: '', institution: '', location: '', graduation_date: '', gpa: '' })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-2 relative">
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeArrayItem('education', index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <div>
                        <Label>Degree</Label>
                        <Input value={edu.degree} onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)} />
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Input value={edu.institution} onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)} />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={edu.location} onChange={(e) => handleArrayItemChange('education', index, 'location', e.target.value)} />
                      </div>
                      <div>
                        <Label>Graduation Date</Label>
                        <Input type="month" value={edu.graduation_date} onChange={(e) => handleArrayItemChange('education', index, 'graduation_date', e.target.value)} />
                      </div>
                      <div>
                        <Label>GPA</Label>
                        <Input value={edu.gpa} onChange={(e) => handleArrayItemChange('education', index, 'gpa', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="bg-gray-50">
                <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Technical Skills</h4>
                    {cvData.skills.technical.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input value={skill} onChange={(e) => handleSkillChange('technical', index, e.target.value)} />
                        <Button variant="ghost" size="sm" onClick={() => removeSkill('technical', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addSkill('technical')}><PlusCircle className="h-4 w-4 mr-2" /> Add Technical Skill</Button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Soft Skills</h4>
                    {cvData.skills.soft.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input value={skill} onChange={(e) => handleSkillChange('soft', index, e.target.value)} />
                        <Button variant="ghost" size="sm" onClick={() => removeSkill('soft', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addSkill('soft')}><PlusCircle className="h-4 w-4 mr-2" /> Add Soft Skill</Button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Languages</h4>
                    {cvData.skills.languages.map((lang, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input value={lang} onChange={(e) => handleSkillChange('languages', index, e.target.value)} />
                        <Button variant="ghost" size="sm" onClick={() => removeSkill('languages', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addSkill('languages')}><PlusCircle className="h-4 w-4 mr-2" /> Add Language</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Certifications</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '', credential_id: '' })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Certification
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.certifications.map((cert, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-2 relative">
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeArrayItem('certifications', index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <div>
                        <Label>Name</Label>
                        <Input value={cert.name} onChange={(e) => handleArrayItemChange('certifications', index, 'name', e.target.value)} />
                      </div>
                      <div>
                        <Label>Issuer</Label>
                        <Input value={cert.issuer} onChange={(e) => handleArrayItemChange('certifications', index, 'issuer', e.target.value)} />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input type="month" value={cert.date} onChange={(e) => handleArrayItemChange('certifications', index, 'date', e.target.value)} />
                      </div>
                      <div>
                        <Label>Credential ID</Label>
                        <Input value={cert.credential_id} onChange={(e) => handleArrayItemChange('certifications', index, 'credential_id', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Projects</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [], url: '' })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Project
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.projects.map((project, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-2 relative">
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeArrayItem('projects', index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <div>
                        <Label>Project Name</Label>
                        <Input value={project.name} onChange={(e) => handleArrayItemChange('projects', index, 'name', e.target.value)} />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={project.description} onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)} rows={3} />
                      </div>
                      <div>
                        <Label>Technologies (comma-separated)</Label>
                        <Input value={project.technologies.join(', ')} onChange={(e) => handleArrayItemChange('projects', index, 'technologies', e.target.value.split(',').map(tech => tech.trim()))} />
                      </div>
                      <div>
                        <Label>Project URL</Label>
                        <Input value={project.url} onChange={(e) => handleArrayItemChange('projects', index, 'url', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={createCV} className="w-full bg-blue-600 hover:bg-blue-700">
                Save CV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User CVs List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Saved CVs</CardTitle>
              <CardDescription>Manage your existing resumes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userCvs.length === 0 ? (
                <p className="text-gray-500">No CVs saved yet. Start building one!</p>
              ) : (
                userCvs.map((cv) => (
                  <div key={cv.id} className="border p-4 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{cv.title}</p>
                      <p className="text-sm text-gray-600">Language: {cv.language.toUpperCase()}</p>
                      {cv.is_ats_compliant && (
                        <p className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> ATS Compliant</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => generatePdf(cv.id)}>
                        <Download className="h-4 w-4 mr-2" /> Generate PDF
                      </Button>
                      {cv.generated_pdf_url && (
                        <a href={cv.generated_pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" /> View PDF
                          </Button>
                        </a>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => deleteCV(cv.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CVBuilder

