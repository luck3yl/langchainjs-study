import { FaissStore } from "@langchain/community/vectorstores/faiss.js"
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import "dotenv/config.js"
import { JSONChatHistory } from "../../JSONChatHistory/index.js"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts.js"
import { RunnableSequence, RunnablePassthrough, RunnableWithMessageHistory, Runnable } from "@langchain/core/runnables.js"
import { Ollama } from "@langchain/community/llms/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers.js"
import { HumanMessage, AIMessage } from "@langchain/core/messages.js"
import { Document } from "@langchain/core/documents.js"
import path from "path"

async function loadVectorStore() {
    const directory = path.join(__dirname, "../../../db/qiu/faiss.index")
    const embeddings = new OllamaEmbeddings({
        model: "mxbai-embed-large",
        baseUrl: "http://localhost:11434",
    })
    const vectorStore = await FaissStore.load(directory, embeddings)
    return vectorStore
}
async function getRephraseChain() {
    const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Given the following conversation and a follow-up question, restate the follow-up question as a standalone question. Note that the restated question should contain enough information to be understood by someone who has not seen the conversation history."
        ],
        new MessagesPlaceholder("history"),
        ["human", "Restate the following question as a separate question: \n{question}"]
    ])

    const rephraseChain = RunnableSequence.from([
        rephraseChainPrompt,
        new Ollama({
            model: "llama3",
            baseUrl: "http://localhost:11434",
            temperature: 0.4,
        }),
        new StringOutputParser()
    ])
    return rephraseChain
}
async function testRephraseChain() {
    const historyMessages = [new HumanMessage("hi, My name is yyl"), new AIMessage("Hi, yyl")]
    const rephraseChain = await getRephraseChain()
    const question = "What do you think of my name?"
    const standalineQuestion =  await rephraseChain.invoke({
        history: historyMessages,
        question
    })
    console.log(standalineQuestion)
}
testRephraseChain()
async function getRagChain() {
    const vectorStore = await loadVectorStore()
    const retriever = vectorStore.asRetriever(2)
    const converDocsToString = (documents: Document[]): string => {
        return documents.map((documents) => documents.pageContent).join("\n")
    }

    const contextRetrieverChain = RunnableSequence.from([
        (input) => input.standalone_question,
        retriever,
        converDocsToString
    ])
    const SYSTEM_TEMPLATE = `
    You are the ultimate original author who is familiar with Liu Cixin's "Ball Lightning". You are proficient in explaining and answering questions in detail based on the original text of the work. You will quote the original text of the work when answering.
    And when answering, you should only answer the user's questions based on the original text. If there is no relevant content in the original text, you can answer "There is no relevant content in the original text."

    The following is the content related to the user’s answer in the original article:
    {context}
    `
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_TEMPLATE],
        new MessagesPlaceholder("history"),
        ["human", "Now, you need to answer the following question based on the original text:\n{standalone_question}`"]
    ])
    const model = new Ollama({
        model: "llama3",
        baseUrl: "http://localhost:11434",
    })
    const rephraseChain = await getRephraseChain();
    const ragChain = RunnableSequence.from([
        RunnablePassthrough.assign({
            standalone_question: rephraseChain,
        }),
        RunnablePassthrough.assign({
            context: contextRetrieverChain
        }),
        prompt,
        model,
        new StringOutputParser()
    ])
    const chatHistoryDir = path.join(__dirname, "../../chat_data");
    const ragChainWithHistory = new RunnableWithMessageHistory({
        runnable: ragChain,
        getMessageHistory: (sessionId) => new JSONChatHistory({ sessionId, dir: chatHistoryDir }) as any,
        historyMessagesKey: "history",
        inputMessagesKey: "question",
    })
    return ragChainWithHistory
}
async function run() {
    const ragChain = await getRagChain()
    const res = await ragChain.invoke({
        question: "What is ball lightning?"
    },{
        configurable: {
            sessionId: "test-history"
        }
    })
    console.log(res, 'res');
}
// run()