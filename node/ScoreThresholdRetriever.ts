import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import "dotenv/config";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
async function run() {
  const directory = '../db/kongyiji';
  const embeddings = new OllamaEmbeddings();
  const vectorstore = await FaissStore.load(directory, embeddings);
  const retriever = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
    minSimilarityScore: 0.5,
    maxK: 5,
    kIncrement: 1,
   })
   const res = await retriever.invoke("茴香豆是做什么用的");
  console.log(res)
}
run()
