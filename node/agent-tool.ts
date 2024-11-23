import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi"
import "dotenv/config"
import { createOpenAIToolsAgent, AgentExecutor } from "langchain/agents";
import { pull } from "langchain/hub";
import { ChatPromptTemplate  } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";
process.env.LANGCHAIN_TRACING_V2 = "true"

const tools = [new SerpAPI(process.env.LANGCHAIN_API_KEY), new Calculator()]
const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-tools-agent")
const llm = new ChatOpenAI({
    temperature: 0,
})
const agent = await createOpenAIToolsAgent({
    llm,
    tools,
    prompt,
})
const agentExecutor = new AgentExecutor({
    agent,
    tools,
})
const result = await agentExecutor.invoke({
    input: "我有 17 美元，现在相当于多少人民币？",
})
console.log(result)