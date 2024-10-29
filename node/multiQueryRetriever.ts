import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

import { Ollama } from "@langchain/community/llms/ollama";
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query';
import "faiss-node";
import "dotenv/config"
async function run() {
  const directory = '../db/kongyiji';
  const embeddings = new OllamaEmbeddings();
  const vectorstore = await FaissStore.load(directory, embeddings);
  const model = new Ollama({
    baseUrl: "http://localhost:11434", 
    model: "llama3", 
  });
  const retriever = MultiQueryRetriever.fromLLM({
    retriever: vectorstore.asRetriever(3),
    llm: model,
    queryCount: 3,
    verbose: true,
  });
  const res = await retriever.getRelevantDocuments("茴香豆是做什么用的");
  console.log(res)
}
run()
