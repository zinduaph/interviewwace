import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/about'
import Pricing from './pages/pricing'
import Stories from './pages/stories'
import Product from './pages/product'
import Demo from './pages/demo'
import DemoDone from './pages/demoDone'
import LiveInterview from './pages/LiveInterview'
import InterviewPage from './pages/interviewPage'
import Dashboard from './pages/dashboard'
import {Toaster} from 'react-hot-toast'
import HowToPassInterviewQuestions from './pages/howToPassInterviewQuestions'
import InterviewQuestionsKenya from './pages/interviewQestionsKenya'
import InterviewPracticeTool from './pages/aiInterviewPracticeTool'
import EntryLevelQuestions from './pages/entryLevelIntereviewQuestionsKenya'
import HowToAnswerWhyShouldWeHireYou from './pages/howToAnswerWhyShouldWeHireYou'
import BeginnerTips from './pages/jobInterviewTipsForBeginners'
import PracticeInterview from './pages/practiceInterviewOnlineFree'
export const backendUrl = import.meta.env.VITE_BACKEND_URL
function App() {
  

  return (
    <>
    <Toaster />
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/about' element={<About />} />
      <Route path='/pricing' element={<Pricing />} />
      <Route path='/stories' element={< Stories />} />
      <Route path='/product' element={<Product />} />
      <Route path='/demo' element={<Demo />} />
      <Route path='/demoDone' element={<DemoDone />} />
      <Route path='/LiveInterview' element={<LiveInterview/>} />
      <Route path='/interviewPage' element={<InterviewPage/>} />
      <Route path='/dashboard' element={<Dashboard/>} />
      <Route path='/howToPassInterviewQuestions' element={<HowToPassInterviewQuestions />} />
      <Route path='/interviewQuestionsKenya' element={<InterviewQuestionsKenya />} />
      <Route path='/aiInterviewPracticeTool' element={<InterviewPracticeTool />} />
      <Route path='/entryLevelInterviewQuestionsKenya' element={<EntryLevelQuestions />} />
      <Route path='/howToAnswerWhyShouldWeHireYou' element={<HowToAnswerWhyShouldWeHireYou/>} />
      <Route path='/jobInterviewTipsForBeginners' element={<BeginnerTips/>} />
      <Route path='/practiceInterviewOnlineFree' element={<PracticeInterview/>} />
    </Routes>
   
    </>
  )
}

export default App
