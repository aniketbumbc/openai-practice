import express from 'express';
import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

async function main(question) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: question }],
    model: 'gpt-3.5-turbo',
  });

  return completion.choices[0]?.message?.content;
}

app.get('/ask', async (req, res) => {
  const response = await main(req.query.question);
  const data = response.replace(/(\r\n|\n|\r)/gm, '');
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
