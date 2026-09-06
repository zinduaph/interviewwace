import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import googleGenAI from "../config/AI.js";
import User from "../model/user.js";
import Practice from "../model/practiceModel.js";
import { json } from "express";

export const extractCvText = async (file) => {
    if (file.mimetype === "application/pdf") {
        const parser = new PDFParse({ data: file.buffer });
        await parser.load();
        const result = await parser.getText();
        return (result.text || "").trim();
    }
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({buffer: file.buffer});
        return result.value.trim();
    }
    throw new Error("Only PDF and DOCX files can be analyzed");
};


export const uploadCv = async (req,res) => {
    try {
        console.log('uploadCv called', { body: req.body, file: req.file ? { fieldname: req.file.fieldname, mimetype: req.file.mimetype, size: req.file.size } : null });
        const {position, jobDescription, company, clerkId} = req.body || {};
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'Invalid request format. Ensure the request is sent as multipart/form-data.' });
        }
        
        if(!position || !jobDescription || !company) {
            return res.status(400).json({message: 'please fill the input fields'});
        }
        
        if(!req.file) {
            return res.status(400).json({message:'please upload your cv'});
        }
        const cvText = await extractCvText(req.file);
        if(!cvText) {
            return res.status(400).json({message:'could not extract text from this CV'});
        }
        

        const uploadResult = await new Promise((resolve, reject) => {
        
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'interviewwace/cvs',
                    resource_type: 'raw',
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => error ? reject(error) : resolve(result)
            );
             
            Readable.from(req.file.buffer).pipe(uploadStream);
        });

        const report = await createReport({cvText, company, position, jobDescription});
        
        const practice = await Practice.create({
            clerkId,
            Cv: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                originalName: req.file.originalname,
                text: cvText
            },
            position,
            company,
            jobDescription,
            report
        });

        return res.status(201).json({message: 'CV uploaded successfully', practice});

    } catch (error) {
      console.error('Experienced error while uploading CV:', error);
      return res.status(500).json({error:"failed to upload"});
        
    }
}

export const createReport = async ({cvText, company, position, jobDescription}) => {
    const prompt = `
    You are an expert interview coach.

Analyze the candidate's CV against the position they want.

COMPANY:
${company}

POSITION:
${position}

CANDIDATE CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Your task is to create a detailed interview preparation report.

Analyze:

1. Candidate's strongest qualifications: exactly 4 items
2. Experience that should be emphasized
3. Skills that make the candidate stand out: exactly 4 items
4. Weaknesses and potential concerns : exactyly 4 items
5. Missing skills compared to the position: exactly 3 items
6. Technical topics the candidate should study: exactly 3 items
7. Behavioral questions they should prepare for: exactly 3 items
8. Technical questions they are likely to receive: exactly 5 items
9. Questions specifically connected to their CV: exactly 4 items
11. How the candidate should introduce themselves: eactly 3 items
12. A preparation plan




Do not give generic advice.

Every recommendation should be connected to:
- the candidate's CV
- the position
- the company

Return the response as valid JSON.

{
  "overallAssessment": {
    "readinessScore": 0,
    "summary": "",
    "matchLevel": "",
    "topPriority": ""
  },

  "strongestPoints": [
    {
      "skill": "",
      "evidence": "",
      "whyItMatters": "",
      "howToEmphasize": ""
    }
  ],

  "whatToEmphasize": [
    {
      "point": "",
      "reason": "",
      "howToPresentIt": ""
    }
  ],

  "weaknesses": [
    {
      "area": "",
      "evidence": "",
      "interviewRisk": "",
      "howToImprove": ""
    }
  ],

  "skillGaps": [
    {
      "skill": "",
      "importance": "",
      "candidateEvidence": "",
      "recommendation": ""
    }
  ],

  "technicalPreparation": [
    {
      "topic": "",
      "importance": "",
      "whyPrepare": "",
      "whatToStudy": []
    }
  ],

  "behavioralPreparation": [
    {
      "topic": "",
      "whyItMatters": "",
      "whatToPrepare": ""
    }
  ],

  "likelyTechnicalQuestions": [
    {
      "question": "",
      "reason": "",
      "whatToPrepare": []
    }
  ],

  "likelyBehavioralQuestions": [
    {
      "question": "",
      "reason": "",
      "whatToPrepare": ""
    }
  ],

  "cvBasedQuestions": [
    {
      "question": "",
      "cvReference": "",
      "whyTheyMayAsk": "",
      "howToPrepare": ""
    }
  ],

  "potentialChallenges": [
    {
      "area": "",
      "whyAnInterviewerMayChallengeIt": "",
      "howToRespond": ""
    }
  ],

  

  "introductionStrategy": {
    "opening": "",
    "experienceToMention": [],
    "skillsToHighlight": [],
    "closing": ""
  },

  "preparationPlan": [
    {
      "priority": 1,
      "area": "",
      "reason": "",
      "action": "",
      "estimatedTime": ""
    }
  ]
}

IMPORTANT:
- readinessScore must be an integer between 0 and 100.
- importance must be one of: "high", "medium", or "low".
- priority must start at 1 and represent the most important preparation areas first.
- Return JSON only.
`;
    

    const response = await googleGenAI.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {role: "system", content: "You are an expert interview coach. Return valid JSON only."},
            {role: "user", content: prompt}
        ],
        temperature: 0.3,
        max_tokens: 6000
    });
    const text = response.choices?.[0]?.message?.content.trim();
    console.log("AI response length:", text?.length);
    console.log("Finish reason:", response.choices?.[0]?.finish_reason);

    let report
    if(!text) {
        throw new Error('AI returned an empty response')
    }

    try {
        report = text
        return JSON.parse(text)
    } catch (error) {
        console.error("Failed to parse AI report:", text);
        console.error("Parse error:", error.message);
        console.error("Response length:", text.length);
        console.error("AI response:", text);

    throw new Error("AI returned invalid JSON");
    }
}