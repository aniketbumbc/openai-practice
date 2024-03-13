import 'dotenv/config';
import openAI from 'openai';

const secretKey = process.env.OPENAI_API_KEY;
const openai = new openAI({
  apiKey: secretKey,
});

const studnet_description =
  "Bunny is a student of computer science at IIT delhi. He is an indian and has a 8.5 GPA. Sunny is known for his programming skills and is an active member of the college's AI Club. He hopes to pursue a career in artificial intelligence after graduating.";

const prompt = `Please extract the following information from the given text and return it as a JSON object

  name
  college
  grades
  club
  
  This is the body of text to extract the information from:
  ${studnet_description}`;

const context = [
  {
    role: 'user',
    content: prompt,
  },
];

function extract_student_info() {
  return '';
}

const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: prompt,
    },
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'extract_student_info',
        description: 'Get student infromation in details',
      },
    },
  ],
});

const willFunctionCall = response.choices[0].finish_reason === 'tool_calls';

if (willFunctionCall) {
  const toolCall = response.choices[0].message.tool_calls[0];
  const toolName = toolCall.function.name;
  if (toolName === 'extract_student_info') {
    const toolResp = extract_student_info();
    context.push(response.choices[0].message);
    context.push({
      role: 'tool',
      content: toolResp,
      tool_call_id: toolCall.id,
    });
  }
}

const resp2 = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo-0613',
  messages: context,
});

console.log(resp2.choices[0].message.content);

// const contentRes = response.choices[0].message.content;
// console.log(JSON.parse(contentRes));
