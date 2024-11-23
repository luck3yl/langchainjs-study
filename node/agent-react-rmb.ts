import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi"
import "dotenv/config"
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import type { PromptTemplate } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";
process.env.LANGCHAIN_TRACING_V2 = "true"

async function main() {
    const tools = [new SerpAPI(process.env.LANGCHAIN_API_KEY), new Calculator()]
    const prompt = await pull<PromptTemplate>("hwchase17/react")
    const llm = new ChatOpenAI({
        configuration: {
            baseURL: "https://api.aigc369.com/v1",
        },
        temperature: 0,
    })
    const agent = await createReactAgent({
        llm,
        tools,
        prompt,
    })
    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    })
    const result = await agentExecutor.invoke({
        input: "I have 17 US dollars, how much is it equivalent to in RMB now?",
    })

    console.log(result)
}

main()