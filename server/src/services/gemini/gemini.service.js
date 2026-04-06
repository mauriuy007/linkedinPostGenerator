import { GoogleGenAI, createPartFromBase64, createUserContent } from '@google/genai';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  return new GoogleGenAI({ apiKey });
};

export async function generatePost({ prompt, imageBase64, imageMimeType }) {
  if (!prompt?.trim()) {
    throw new Error('Prompt is required to generate a post');
  }

  console.log('Gemini generatePost - input:', {
    prompt,
    hasImage: Boolean(imageBase64 && imageMimeType),
    imageMimeType: imageMimeType ?? null,
    imageBase64Length: imageBase64?.length ?? 0,
  });

  const userParts = [
    [
      'Generate a professional LinkedIn post in Spanish based on the provided context.',
      'Return plain text only, without markdown or quotation marks.',
      'The post should be concise, engaging, and ready to publish on LinkedIn.',
      `Context from the user: ${prompt.trim()}`,
    ].join(' '),
  ];

  if (imageBase64 && imageMimeType) {
    userParts.push(createPartFromBase64(imageBase64, imageMimeType));
  }

  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [createUserContent(userParts)],
  });

  console.log('Gemini generatePost - raw response text:', response.text);

  const generatedText = response.text?.trim();

  if (!generatedText) {
    throw new Error('Gemini did not return any post content');
  }

  console.log('Gemini generatePost - final generated text:', generatedText);

  return generatedText;
}
