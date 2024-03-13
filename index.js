import 'dotenv/config';
import openAI from 'openai';

const secretKey = process.env.OPENAI_API_KEY;
const openai = new openAI({
  apiKey: secretKey,
});

function getCurrentTimeOfDay() {
  return '5.30';
}

function getOrderStatus(orderId) {
  console.log('Your Order Id is ', orderId);
  const orderIdInt = parseInt(orderId);
  console.log('orderIdInt', orderIdInt);
  if (orderIdInt % 2 === 0) {
    return 'Order in process';
  }
  return 'Order is Complete';
}

function getAvailFlight(dep, arrival) {
  console.log('getting flight information');
  if (dep === 'MUM' && arrival === 'LAX') {
    return ['MUM 123', 'AA 90'];
  }

  if (dep === 'BAL' && arrival === 'LON') {
    return ['BAL 123', 'BB 90'];
  }

  return ['MUM 23'];
}

function flightRes(flightNum) {
  if (flightNum.length == 7) {
    return '567890';
  } else {
    return 'FULLY_BOOKED';
  }
}

const context = [
  {
    role: 'system',
    content:
      'You are helpful assistant that gives flight reservation information',
  },
  {
    role: 'user',
    content: 'What is status of order 304',
  },
];

async function callOpenAIFunction() {
  const resp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: context,
    tools: [
      {
        type: 'function',
        function: {
          name: 'getCurrentTimeOfDay',
          description: 'Get the time of day',
        },
      },
      {
        type: 'function',
        function: {
          name: 'getOrderStatus',
          description: 'return the status of order',
          parameters: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'Id of order status',
              },
            },
            required: ['orderId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getAvailFlight',
          description:
            'return flights information given source and destination',
          parameters: {
            type: 'object',
            properties: {
              dep: {
                type: 'string',
                description: 'Departure airport code',
              },
              arrival: {
                type: 'string',
                description: 'Arrival airport code',
              },
            },
            required: ['dep', 'arrival'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'flightRes',
          description: 'return flights id for source and destination',
          parameters: {
            type: 'object',
            properties: {
              flightNum: {
                type: 'string',
                description: 'flightNum code',
              },
            },
            required: ['flightNum'],
          },
        },
      },
    ],

    tool_choice: 'auto',
  });

  const willFunctionCall = resp.choices[0].finish_reason === 'tool_calls';

  if (willFunctionCall) {
    const toolCall = resp.choices[0].message.tool_calls[0];
    const toolName = toolCall.function.name;

    if (toolName === 'getCurrentTimeOfDay') {
      const toolResp = getCurrentTimeOfDay();
      context.push(resp.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResp,
        tool_call_id: toolCall.id,
      });
    }

    if (toolName === 'getOrderStatus') {
      const argFun = toolCall.function.arguments;
      const parsArg = JSON.parse(argFun);
      const toolResp = getOrderStatus(parsArg.orderId);
      context.push(resp.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResp,
        tool_call_id: toolCall.id,
      });
    }

    if (toolName === 'getAvailFlight') {
      const argFun = toolCall.function.arguments;
      const parsArg = JSON.parse(argFun);
      const toolResp = getAvailFlight(parsArg.dep, parsArg.arrival);
      context.push(resp.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResp.toString(),
        tool_call_id: toolCall.id,
      });
    }

    if (toolName === 'flightRes') {
      const argFun = toolCall.function.arguments;
      const parsArg = JSON.parse(argFun);
      const reservationNumber = flightRes(parsArg.flightNum);
      context.push(resp.choices[0].message);
      context.push({
        role: 'tool',
        content: reservationNumber,
        tool_call_id: toolCall.id,
      });
    }
  }

  const resp2 = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: context,
  });

  console.log(resp2.choices[0].message.content);
}

console.log('Welcome Flight Assistance');
process.stdin.addListener('data', async function (input) {
  let userInput = input.toString().trim();
  context.push({
    role: 'assistant',
    content: userInput,
  });
  await callOpenAIFunction();
});
