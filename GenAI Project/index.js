import 'dotenv/config';
import openAI from 'openai';

const secretKey = process.env.OPENAI_API_KEY;
const openai = new openAI({
  apiKey: secretKey,
});

const studnet_description =
  "Aniket is a student of computer science at IIT delhi. He is an indian and has a 8.5 GPA. Sunny is known for his programming skills and is an active member of the college's AI Club. He hopes to pursue a career in artificial intelligence after graduating.";

const prompt = `Please extract the following information from the given text and return it as a JSON object

  name
  college
  grades
  club
  
  This is the body of text to extract the information from:
  ${studnet_description}`;

const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: prompt,
    },
  ],
});
const contentRes = response.choices[0].message.content;
console.log(JSON.parse(contentRes));
