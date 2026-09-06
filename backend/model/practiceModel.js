import mongoose from "mongoose"

const practiceModel = new mongoose.Schema({
       clerkId: { 
        type: String, 
        required: true,
        index: true
    },
    Cv : {url: String,
      publicId: String,
      originalName: String,
      text: String},
    position: {type: String, required:true },
    company: {type:String, required:true},
    jobDescription: {type:String, required:true},
    report: {
      overallAssessment: mongoose.Schema.Types.Mixed,

      strongestPoints: [
        mongoose.Schema.Types.Mixed
      ],

      emphasize: [
        mongoose.Schema.Types.Mixed
      ],

      weaknesses: [
        mongoose.Schema.Types.Mixed
      ],

      skillGaps: [
        mongoose.Schema.Types.Mixed
      ],

      technicalPreparation: [
        mongoose.Schema.Types.Mixed
      ],

      likelyQuestions: [
        mongoose.Schema.Types.Mixed
      ],

      cvBasedQuestions: [
        mongoose.Schema.Types.Mixed
      ],

      behavioralQuestions: [
        mongoose.Schema.Types.Mixed
      ],

      companyPreparation: [
        mongoose.Schema.Types.Mixed
      ],

      introductionStrategy: mongoose.Schema.Types.Mixed,

      questionsToAskEmployer: [
        mongoose.Schema.Types.Mixed
      ],

      preparationPlan: [
        mongoose.Schema.Types.Mixed
      ]
    }
  

})

export default mongoose.model('Practice', practiceModel);