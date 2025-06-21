import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  Mic, 
  Camera, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Brain, 
  Star, 
  ThumbsUp, 
  ThumbsDown
} from 'lucide-react'

const MockInterview = () => {
  const { user, isAuthenticated, loading, token } = useAuth()
  const navigate = useNavigate()
  const API_BASE_URL = 'http://localhost:5000/api'

  const [majors, setMajors] = useState([])
  const [selectedMajor, setSelectedMajor] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [interviewSession, setInterviewSession] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userResponse, setUserResponse] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [interviewReport, setInterviewReport] = useState(null)
  const [error, setError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
    fetchMajors()
  }, [isAuthenticated, loading, navigate])

  const fetchMajors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/majors`)
      if (response.ok) {
        const data = await response.json()
        setMajors(data.majors)
      } else {
        setError('Failed to fetch majors.')
      }
    } catch (err) {
      setError('Network error: Could not connect to API.')
      console.error(err)
    }
  }

  const startInterview = async () => {
    setError(null)
    if (!selectedMajor || !selectedLanguage) {
      setError('Please select a major and language.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/interviews/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          major: selectedMajor,
          language: selectedLanguage,
          num_questions: 5 // Default to 5 questions
        })
      })

      const data = await response.json()
      if (response.ok) {
        setInterviewSession(data.interview)
        setCurrentQuestionIndex(0)
        setUserResponse('')
        setFeedback(null)
        setInterviewReport(null)
      } else {
        setError(data.error || 'Failed to start interview.')
      }
    } catch (err) {
      setError('Network error: Could not start interview.')
      console.error(err)
    }
  }

  const submitResponse = async () => {
    setError(null)
    if (!userResponse.trim()) {
      setError('Please provide a response.')
      return
    }

    const currentQuestion = interviewSession.questions[currentQuestionIndex]

    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewSession.id}/submit-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          response_text: userResponse,
          // audio_url: 'mock_audio_url.wav' // Placeholder for audio upload
        })
      })

      const data = await response.json()
      if (response.ok) {
        setFeedback(data.response)
        setUserResponse('') // Clear response after submission
      } else {
        setError(data.error || 'Failed to submit response.')
      }
    } catch (err) {
      setError('Network error: Could not submit response.')
      console.error(err)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < interviewSession.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
      setFeedback(null)
      setUserResponse('')
    } else {
      completeInterview()
    }
  }

  const completeInterview = async () => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewSession.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        fetchInterviewReport(interviewSession.id)
      } else {
        setError(data.error || 'Failed to complete interview.')
      }
    } catch (err) {
      setError('Network error: Could not complete interview.')
      console.error(err)
    }
  }

  const fetchInterviewReport = async (interviewId) => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setInterviewReport(data.report)
      } else {
        setError(data.error || 'Failed to fetch report.')
      }
    } catch (err) {
      setError('Network error: Could not fetch report.')
      console.error(err)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data])
      }
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        // In a real app, you would upload this blob to your backend
        console.log('Audio recorded:', audioBlob)
        setAudioChunks([])
        // For now, we'll just indicate recording is done
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Could not access microphone. Please ensure it is connected and permissions are granted.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mock Interview Simulation</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!interviewSession && !interviewReport && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Start a New Interview</CardTitle>
            <CardDescription>Select your major and preferred language for the interview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="major">Major</Label>
              <Select onValueChange={setSelectedMajor} value={selectedMajor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a major" />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major.id} value={major.id}>
                      {selectedLanguage === 'ar' ? major.name_ar : major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={startInterview} className="w-full bg-blue-600 hover:bg-blue-700">
              Start Interview
            </Button>
          </CardContent>
        </Card>
      )}

      {interviewSession && !interviewReport && (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Interview in Progress</CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {interviewSession.questions.length}
            </CardDescription>
            <Progress value={((currentQuestionIndex + 1) / interviewSession.questions.length) * 100} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border">
              <p className="text-lg font-semibold mb-2">Question:</p>
              <p className="text-gray-800">
                {interviewSession.questions[currentQuestionIndex]?.question_text}
              </p>
            </div>

            <div>
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Type your answer here..."
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                rows={5}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                className="flex items-center space-x-2"
              >
                {isRecording ? <Mic className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2" disabled>
                <Camera className="h-5 w-5" />
                <span>Start Camera (Coming Soon)</span>
              </Button>
            </div>

            <Button onClick={submitResponse} className="w-full bg-green-600 hover:bg-green-700 flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Submit Response</span>
            </Button>

            {feedback && (
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">AI Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-800">{feedback.ai_feedback_text}</p>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Clarity: {feedback.clarity_score}/5</span>
                    <span>Relevance: {feedback.relevance_score}/5</span>
                    <span>Sentiment: {feedback.sentiment_score}/5</span>
                  </div>
                  <Button onClick={nextQuestion} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 flex items-center space-x-2">
                    Next Question <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {interviewReport && (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Interview Report</CardTitle>
            <CardDescription>Detailed feedback on your performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Overall Score:</h3>
              <span className="text-3xl font-bold text-blue-600">{interviewReport.summary.overall_score?.toFixed(1)} / 5</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Strengths:</h3>
              <ul className="list-disc list-inside text-green-700">
                {interviewReport.summary.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center"><ThumbsUp className="h-4 w-4 mr-2" />{strength}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Areas for Improvement:</h3>
              <ul className="list-disc list-inside text-red-700">
                {interviewReport.summary.areas_for_improvement.map((area, index) => (
                  <li key={index} className="flex items-center"><ThumbsDown className="h-4 w-4 mr-2" />{area}</li>
                ))}
              </ul>
            </div>

            <h3 className="text-xl font-semibold">Question-by-Question Feedback:</h3>
            {interviewReport.questions.map((q, qIndex) => (
              <Card key={q.id} className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Question {qIndex + 1}: {q.question_text}</CardTitle>
                </CardHeader>
                <CardContent>
                  {q.responses.length > 0 ? (
                    <div className="space-y-2">
                      <p className="font-medium">Your Response:</p>
                      <p className="text-gray-700">{q.responses[0].user_response_text}</p>
                      <p className="font-medium mt-2">AI Feedback:</p>
                      <p className="text-gray-700">{q.responses[0].ai_feedback_text}</p>
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Clarity: {q.responses[0].clarity_score}/5</span>
                        <span>Relevance: {q.responses[0].relevance_score}/5</span>
                        <span>Sentiment: {q.responses[0].sentiment_score}/5</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No response recorded for this question.</p>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button onClick={() => setInterviewSession(null)} className="w-full bg-blue-600 hover:bg-blue-700">
              Start New Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MockInterview

