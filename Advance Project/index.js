import 'dotenv/config';
import openAI from 'openai';
import math from 'advanced-calculator';

const QUESTION = process.argv[2] || 'Hi';

const messages = [
  {
    role: 'user',
    content: QUESTION,
  },
];

const funcations = {
  // function call by openai
  calculate({ exp }) {
    return math.evaluate(exp);
  },

  // another open ai function call
  async genrateImage({ prompt }) {
    const result = await openai.images.generate({ prompt });
    console.log(result?.data[0]?.url);
  },
};

const secretKey = process.env.OPENAI_API_KEY;
const openai = new openAI({
  apiKey: secretKey,
});

const getCompletion = async (message) => {
  return await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages,
    temperature: 0,
    functions: [
      {
        name: 'calculate',
        description: 'Run math expression',
        parameters: {
          type: 'object',
          properties: {
            exp: {
              type: 'string',
              description: 'the match expression evaluate like 2*5 /10',
            },
          },
          required: ['exp'],
        },
      },
      {
        name: 'genrateImage',
        description: 'Generate image based on prompt',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'the text for image generation',
            },
          },
          required: ['prompt'],
        },
      },
    ],
  });
};

let response;

while (true) {
  response = await getCompletion(messages);

  if (response.choices[0].finish_reason === 'stop') {
    console.log(response.choices[0].message.content);
    break;
  } else if (response.choices[0].finish_reason === 'function_call') {
    const fName = response.choices[0].message.function_call.name;
    const fargs = response.choices[0].message.function_call.arguments;

    const funcToCall = await funcations[fName];
    const params = JSON.parse(fargs);

    const results = funcToCall(params);

    messages.push({
      role: 'assistant',
      content: null,
      function_call: {
        name: fName,
        arguments: fargs,
      },
    });

    messages.push({
      role: 'function',
      name: fName,
      content: JSON.stringify({ result: results }),
    });
  }
}
