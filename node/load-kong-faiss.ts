import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/community/embeddings/ollama";
import "faiss-node";
import "dotenv/config";

async function run() {
  const directory = "../db/kongyiji";
  const embeddings = new OpenAIEmbeddings();

  try {
    // 加载 FaissStore
    const vectorstore = await FaissStore.load(directory, embeddings);

    // 创建检索器
    const retriever = vectorstore.asRetriever(2);

    // 执行查询
    const res = await retriever.invoke("茴香豆是做什么用的");

    // 输出结果
    console.log(res);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
