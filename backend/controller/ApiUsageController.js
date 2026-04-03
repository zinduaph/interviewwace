import ApiUsage from "../model/ApiUsage.js";
import { getDailyUsage } from "../utils/apilimit.js";

// routes — admin only, protect this with auth middleware
export const getApiUsage = async (req, res) => {
    try {
        // Get today's usage using the helper function
        const today = await getDailyUsage();
        
        // Also get last 7 days for trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const history = await ApiUsage.find({
            date: { $gte: sevenDaysAgo.toISOString().split('T')[0] }
        }).sort({ date: -1 });

        return res.json({
            today,
            history,
            warning: today.safeRemaining < 100 ? "⚠️ Running low on daily requests" : null
        });
    } catch (error) {
        console.error("Error fetching API usage:", error);
        return res.status(500).json({ error: "Failed to fetch usage" });
    }
};