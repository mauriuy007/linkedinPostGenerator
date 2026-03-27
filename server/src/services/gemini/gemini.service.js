import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

//missing import of what the client sends in the request to our backend

const ai = new GoogleGenAI({});

async function main() {
  const image = await ai.files.upload({
    file: "/path/to/organ.png",
  });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      createUserContent([
        "Generate a LinkedIn post based on the following image and context: [context here]", //This should be the prompt the client sends us
        createPartFromUri(image.uri, image.mimeType), //here we must use the image url the client sends us 
      ]),
    ],
  });
  console.log(response.text);
}

await main();