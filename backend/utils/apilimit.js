import ApiUsage from "../model/ApiUsage.js";


const DAILY_LIMIT = 1000;
const SAFE_LIMIT = 900;

const getTodayKey = () => new Date().toISOString().split('T')[0]; // "2024-01-27"

export const checkAndIncrementUsage = async (req,res) => {
     const today = getTodayKey()

     try {
        const usage = await ApiUsage.findOneAndUpdate({ date: today },
        { 
            $inc: { requestCount: 1 },
            $set: { lastUpdated: new Date() }
        },
        { upsert: true, new: true })
        if(usage.requestCount > SAFE_LIMIT){
            return res.json({message:"reached Daily limit try again tommorow"})
        }

         return usage.requestCount;
     } catch (error) {
        
     }
}

export const getDailyUsage = async () => {
    const today = getTodayKey();
    const usage = await ApiUsage.findOne({ date: today });
    return {
        used: usage?.requestCount || 0,
        remaining: DAILY_LIMIT - (usage?.requestCount || 0),
        safeRemaining: SAFE_LIMIT - (usage?.requestCount || 0),
        limitReached: (usage?.requestCount || 0) >= SAFE_LIMIT
    };
};