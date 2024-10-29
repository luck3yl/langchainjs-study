import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import "dotenv/config"
process.env.LANGCHAIN_VERBOSE = "true";
async function run() {
  const directory = '../db/kongyiji';
  const embeddings = new OllamaEmbeddings();
  console.log('Loading vectorstore...');
  const vectorstore = await FaissStore.load(directory, embeddings);
  console.log('Vectorstore loaded:', vectorstore);

  const model = new Ollama({
    baseUrl: "http://localhost:11434", 
    model: "llama3", 
  });
  const compressor = LLMChainExtractor.fromLLM(model);
  const retriever = new ContextualCompressionRetriever({
    baseCompressor: compressor,
    baseRetriever: vectorstore.asRetriever(2),
  });
  const res = await retriever.invoke("茴香豆是做什么用的");
  
  console.log(res)
  const simpleRetriever = vectorstore.asRetriever();
const simpleRes = await simpleRetriever.invoke("茴香豆是做什么用的");
console.log('Simple Retriever Result:', simpleRes);

}
run()
