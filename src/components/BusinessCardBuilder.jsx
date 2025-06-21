import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Trash2, Download, QrCode, Share2 } from 'lucide-react'

const BusinessCardBuilder = () => {
  const { user, isAuthenticated, loading, token } = useAuth()
  const navigate = useNavigate()
  const API_BASE_URL = 'http://localhost:5000/api'

  const [cardTemplates, setCardTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [cardData, setCardData] = useState(null)
  const [cardTitle, setCardTitle] = useState('My New Business Card')
  const [cardLanguage, setCardLanguage] = useState('en')
  const [userCards, setUserCards] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
    fetchCardTemplates()
    fetchUserCards()
    fetchSampleCardData()
  }, [isAuthenticated, loading, navigate])

  const fetchCardTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business-cards/templates`)
      if (response.ok) {
        const data = await response.json()
        setCardTemplates(data.templates)
      } else {
        setError('Failed to fetch business card templates.')
      }
    } catch (err) {
      setError('Network error: Could not connect to API.')
      console.error(err)
    }
  }

  const fetchUserCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business-cards/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserCards(data.business_cards)
      } else {
        setError('Failed to fetch user business cards.')
      }
    } catch (err) {
      setError('Network error: Could not fetch user business cards.')
      console.error(err)
    }
  }

  const fetchSampleCardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business-cards/sample-data`)
      if (response.ok) {
        const data = await response.json()
        setCardData(data.sample_data)
      } else {
        setError('Failed to fetch sample business card data.')
      }
    } catch (err) {
      setError('Network error: Could not fetch sample business card data.')
      console.error(err)
    }
  }

  const handleInputChange = (field, value) => {
    setCardData(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  const createBusinessCard = async () => {
    setError(null)
    setSuccessMessage(null)
    if (!selectedTemplate || !cardData || !cardTitle || !cardLanguage) {
      setError('Please fill all required fields: Template, Title, Language, and Card Data.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/business-cards/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template_id: selectedTemplate,
          language: cardLanguage,
          card_data: cardData,
          title: cardTitle
        })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccessMessage('Business card created successfully!')
        fetchUserCards()
      } else {
        setError(data.error || 'Failed to create business card.')
      }
    } catch (err) {
      setError('Network error: Could not create business card.')
      console.error(err)
    }
  }

  const deleteBusinessCard = async (cardId) => {
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/business-cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccessMessage('Business card deleted successfully!')
        fetchUserCards()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete business card.')
      }
    } catch (err) {
      setError('Network error: Could not delete business card.')
      console.error(err)
    }
  }

  if (loading || !cardData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Digital Business Card Builder</h1>

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
        {/* Business Card Form */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create/Edit Your Digital Business Card</CardTitle>
              <CardDescription>Fill in your details to create your digital business card.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="cardTitle">Card Title</Label>
                <Input
                  id="cardTitle"
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="e.g., My Professional Card"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardLanguage">Language</Label>
                <Select onValueChange={setCardLanguage} value={cardLanguage}>
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
                    <SelectValue placeholder="Select a business card template" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} {template.is_premium && '(Premium)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Card Data Fields */}
              <Card className="bg-gray-50">
                <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={cardData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" value={cardData.job_title} onChange={(e) => handleInputChange('job_title', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" value={cardData.company} onChange={(e) => handleInputChange('company', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={cardData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={cardData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={cardData.website} onChange={(e) => handleInputChange('website', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input id="linkedin" value={cardData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter Handle</Label>
                    <Input id="twitter" value={cardData.twitter} onChange={(e) => handleInputChange('twitter', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={cardData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={cardData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                    <Input id="profileImageUrl" value={cardData.profile_image_url} onChange={(e) => handleInputChange('profile_image_url', e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={createBusinessCard} className="w-full bg-blue-600 hover:bg-blue-700">
                Save Business Card
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Business Cards List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Business Cards</CardTitle>
              <CardDescription>Manage your existing digital business cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userCards.length === 0 ? (
                <p className="text-gray-500">No business cards saved yet. Start creating one!</p>
              ) : (
                userCards.map((card) => (
                  <div key={card.id} className="border p-4 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{card.title}</p>
                      <p className="text-sm text-gray-600">Language: {card.language.toUpperCase()}</p>
                    </div>
                    <div className="flex space-x-2">
                      {card.qr_code_image_url && (
                        <a href={card.qr_code_image_url} download={`${card.title}_QR.png`}>
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4 mr-2" /> Download QR
                          </Button>
                        </a>
                      )}
                      {card.digital_card_url && (
                        <a href={card.digital_card_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" /> View Card
                          </Button>
                        </a>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => deleteBusinessCard(card.id)}>
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

export default BusinessCardBuilder

