import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

type DataQualityResponse = {
    data_to_use: {
        columns: string[];
        explanation: string;
    }
    preferred_data_if_not_exists: {
        columns: string[];
        explanation: string;
    }
};

const directoryPath = path.join(__dirname, '../../../../../data');
let columnVectorsIndex: number[][];
let columns: string[];

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Could not list the directory.', err);
    process.exit(1);
  }

  files.forEach((file, _) => {
    if (path.extname(file) === ".json" && file !== "index.json" && file === "frontend-embedding.json") {
      fs.readFile(path.join(directoryPath, file), 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}`, err);
          return;
        }

        const jsonData: number[][] = JSON.parse(data);
        columnVectorsIndex = jsonData;
      });
    }

    if (path.extname(file) === ".csv" && file === "columns-frontend.csv") {
      fs.readFile(path.join(directoryPath, file), 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}`, err);
          return;
        }

        columns = data.split(",");
      });
    }
  });
});

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  return dotProduct;
}


function getTopKColumns(userEmbedding: number[], columns: string[], k: number = 50): [string, number][] {
    let similarities: [string, number][] = [];
    for (let i = 0; i < columns.length; i++) {
      let cosineSimilarityScore = cosineSimilarity(userEmbedding, columnVectorsIndex[i]);
      similarities.push([columns[i], cosineSimilarityScore]);
    }
    return similarities.sort((a, b) => b[1] - a[1]).slice(0, k); // Removed the extra parenthesis
}

function trimMarkdownBacktickAndJsonThing(input: string): string {
    return input.replace(/`/g, "").replace(/json/g, "").trim();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const nlq = body.input;

  const nlqEmbeddingResponse = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: nlq,
  });

  const nlqEmbedding = nlqEmbeddingResponse.data[0].embedding;

  const topColumns = getTopKColumns(nlqEmbedding, columns);

  const messages: ChatCompletionMessageParam[] = [];
  messages.push({
    role: "system",
    content: `You are an expert on modern application and infrastructure Observability.
    In particular, you have detailed knowledge of knowledge of the data schema used for various Observability questions,
    and are effective at judging if columns/fields/attributes in this schema are appropriate for various tasks.`
  });

  messages.push({
    role: "system",
    content: `You are asked to judge the quality of a given schema for use in Natural Language Querying (NLQ).`
  });

  messages.push({
    role: "user",
    content: `NLQ: ${nlq}
    COLUMNS: ${topColumns}

    Given NLQ and my schema COLUMNS, determine which columns could be used for NLQ.

    If COLUMNS has items you believe are useful for NLQ, list them.
    
    If you believe NLQ is not answerable with COLUMNS, suggest columns that would help.
    
    Format your answer as a JSON object with the following structure:
    
    {
        "data_to_use":{
            "columns":["example1","example2"],
            "explanation":"explanation for why these can be used"
        },
        "preferred_data_if_not_exists":{
            "columns:["example1","example2"],
            "explanation":"optional explanation for any preferred columns"
        }
        "docs_url":"https://docs.honeycomb.io/getting-data-in/"
    }
    
    Answer succinctly.`
  });

  const resp = await client.chat.completions.create({
    model: "gpt-4-turbo-preview", // gpt-3.5-turbo-0125
    messages: messages,
    temperature: 0.0,
    response_format: {"type": "json_object"},
  });

  let responseContent = resp.choices[0].message.content?.trim()
  if (responseContent === undefined) {
    return NextResponse.json({
      content: "I'm sorry, I don't understand. Please try again.",
      urls: [],
    });
  }

  responseContent = trimMarkdownBacktickAndJsonThing(responseContent);
  const dataQualityResponse: DataQualityResponse = JSON.parse(responseContent);

  let content = "Hey friendo, ";
  
  if (dataQualityResponse.data_to_use.columns.length > 0) {
    content += "\n\nIt looks like you have some columns that could help you out:\n\n"
    for (let column of dataQualityResponse.data_to_use.columns) {
        content += `\t* ${column}\n`;
    }
    content += `\nHere's why:\n\n${dataQualityResponse.data_to_use.explanation}\n\n`;
  } else {
    content += "\n\nIt doesn't seem like you have the data to answer your question.\n\n";
  }

  if (dataQualityResponse.preferred_data_if_not_exists.columns.length > 0) {
    content += `\n\nSome columns that could potentially help a lot more are:\n\n`
    for (let column of dataQualityResponse.preferred_data_if_not_exists.columns) {
      content += `\t* ${column}\n`;
    }
    content += `\nHere's why:\n\n${dataQualityResponse.preferred_data_if_not_exists.explanation}\n\n`;
  }

  return NextResponse.json({
    content: content,
    urls: ["https://docs.honeycomb.io/getting-data-in/"],
  });
}