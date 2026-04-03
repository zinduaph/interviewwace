import OpenAI from 'openai';

let googleGenAI;

const getOpenAIClient = () => {
  if (!googleGenAI) {
    googleGenAI = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return googleGenAI;
};

const googleGenAIProxy = new Proxy({}, {
  get: (target, prop) => {
    return getOpenAIClient()[prop];
  }
});

export default googleGenAIProxy;
