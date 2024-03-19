import 'dotenv';
import OpenAI from 'openai';
import { getWeather } from '../../open-ai-chat/weather.js';
import fs from 'fs';

console.log(process.env.OPENAI_API_KEY);

const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

const QUESTION = process.argv[2] || 'Hi';

function saveToFile(name, content) {
  fs.writeFileSync(name, content);
}

const getWeatherData = {
  name: 'weather',
  description: 'Get the current weather for a city',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'The city',
      },
    },
    required: ['city'],
  },
};
const saveToFileFunction = {
  name: 'saveToFile',
  description: 'save content to a file',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the file',
      },
      content: {
        type: 'string',
        description: 'The content to save',
      },
    },
  },
  required: ['name', 'content'],
};

async function callChatGpt() {
  const messages = [
    {
      role: 'system',
      content: 'You give me short ansers',
    },
    {
      role: 'user',
      content: QUESTION,
    },
  ];

  while (true) {
    console.log('*********** FIRST REQUEST ************');
    console.log(messages);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      functions: [getWeatherData, saveToFileFunction],
    });

    let respMsg = response.choices[0].message;
    console.log('Got response', respMsg);
    messages.push(respMsg);

    if (respMsg.function_call?.name === 'weather') {
      const args = JSON.parse(respMsg.function_call.arguments);
      const city = args.city;
      console.log('Here is city name', city);

      const weatherInfo = await getWeather(city);
      messages.push({
        role: 'function',
        name: 'getWeather',
        content: JSON.stringify(weatherInfo),
      });
    } else if (respMsg.function_call?.name === 'saveToFile') {
      const args = JSON.parse(respMsg.function_call.arguments);
      saveToFile(args.name, args.content);
    } else if (response.choices[0].finish_reason === 'stop') {
      return respMsg;
    }
  }
}

const finalMessage = await callChatGpt();
console.log('****** Final Response ', finalMessage.content, '**********');
