import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApiUsage = () => {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/');
        }
        getApiUsage();
    }, [navigate]);

    const getApiUsage = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(
                '/api/api-usage',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUsage(response.data);
        } catch (error) {
            console.error('Error fetching API usage:', error);
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-gray-500">Loading API usage...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-10 bg-black p-5">
            {/* Header */}
            <div className="flex justify-between mt-10 items-center px-10 py-5 border-b border-gray-800 bg-zinc-950">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-yellow-400 tracking-widest">WACE</h1>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">API Usage</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={goBack}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-700"
                    >
                        ← Back to Users
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-transparent text-yellow-400 border border-yellow-400 rounded-md font-semibold hover:bg-yellow-400 hover:text-black"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-10">
                {/* Today's Stats */}
                {usage?.today && (
                    <div className="grid grid-cols-4 gap-5 mb-8">
                        <div className="bg-zinc-900 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-2">Used Today</h3>
                            <p className="text-white text-3xl font-bold">{usage.today.used}</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-2">Remaining</h3>
                            <p className="text-yellow-400 text-3xl font-bold">{usage.today.remaining}</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-2">Safe Limit</h3>
                            <p className="text-yellow-400 text-3xl font-bold">{usage.today.safeRemaining}</p>
                        </div>
                        <div className={`p-6 rounded-xl border ${usage.today.limitReached ? 'bg-zinc-900 border-red-600' : 'bg-zinc-900 border-gray-800'}`}>
                            <h3 className="text-gray-500 text-sm mb-2">Status</h3>
                            <p className={`text-3xl font-bold ${usage.today.limitReached ? 'text-red-600' : 'text-yellow-400'}`}>
                                {usage.today.limitReached ? 'LIMIT REACHED' : 'OK'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Warning */}
                {usage?.warning && (
                    <div className="bg-yellow-400/10 text-yellow-400 px-5 py-4 rounded-lg mb-8 border border-yellow-400/30">
                        ⚠️ {usage.warning}
                    </div>
                )}

                {/* History */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-yellow-400 text-xl mb-5">Last 7 Days</h2>
                    {usage?.history && (
                        <div className="flex flex-col gap-4">
                            {usage.history.map((day, index) => (
                                <div key={index} className="flex items-center gap-5 p-3 bg-zinc-950 rounded-lg">
                                    <div className="text-gray-400 text-sm w-32">
                                        {new Date(day.date).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${(day.requestCount / 1000) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-gray-500 text-sm w-24 text-right">
                                        {day.requestCount} / 1000
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiUsage;