import express from 'express';
import {  generateQuestions, submitAllAnswers,  completeInterview, getInterview,getUserInterviews, checkFreeDemo, incrementDemo, associateInterview } from '../controller/demoController.js';

const router = express.Router();

// Check if user can do free demo
router.post('/check-free-demo', checkFreeDemo);

// for checking free demo increment
router.post('/increment',incrementDemo)

// Generate 6 interview questions (free demo - no auth required)
router.post('/generate', generateQuestions);

// Submit all answers and get feedback for all at once
router.post('/save-answers', submitAllAnswers);

// Complete interview and get final score
router.post('/complete', completeInterview);

// Get interview by ID
router.get('/:id', getInterview);

// Get all interviews for a user
router.get('/user/:clerkId', getUserInterviews);

// Associate interview with user (sign-in after demo)
router.post('/associate', associateInterview);

export default router;
