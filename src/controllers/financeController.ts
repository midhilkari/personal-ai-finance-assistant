import { Request, Response, NextFunction } from "express";
// import { createGraph } from "../langgraph/graph";
// import { DatabaseService } from "../services/databaseService";

// const dbService = new DatabaseService();

// export const kiteLogin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { KiteConnect } = require("kiteconnect");
//   const { config } = require("../config/env");
//   const kc = new KiteConnect({ api_key: config.kiteApiKey });
//   res.redirect(kc.getLoginURL());
// };

// export const kiteCallback = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { request_token, userId } = req.query as {
//     request_token: string;
//     userId: string;
//   };
//   try {
//     const state = await dbService.loadUserState(userId);
//     const graph = createGraph();
//     const result = await graph.invoke({ ...state, userId, requestToken });
//     await dbService.saveUserState(userId, result);
//     res.json({
//       message: "Kite authentication successful",
//       accessToken: result.kiteAccessToken,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const uploadExcel = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.body.userId || "default_user";
//   try {
//     const state = await dbService.loadUserState(userId);
//     const graph = createGraph();
//     const result = await graph.invoke({
//       ...state,
//       userId,
//       excelData: req.file,
//     });
//     await dbService.saveUserState(userId, result);
//     res.json({ message: "Excel file processed", state: result });
//   } catch (error) {
//     next(error);
//   }
// };

// export const query = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { userId, query } = req.body as { userId: string; query: string };
//   try {
//     const state = await dbService.loadUserState(userId);
//     if (!state.kiteAccessToken) {
//       return res.status(401).json({ error: "Kite authentication required" });
//     }
//     const graph = createGraph();
//     const result = await graph.invoke({ ...state, userId, query });
//     await dbService.saveUserState(userId, result);
//     res.json({
//       recommendations: result.recommendations,
//       orderId: result.orderId,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Define the tools for the agent to use
    const tools = [new TavilySearch({ maxResults: 3 })];
    const toolNode = new ToolNode(tools);

    // Create a model and give it access to the tools
    const model = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    }).bindTools(tools);

    // Define the function that determines whether to continue or not
    function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
      const lastMessage = messages[messages.length - 1] as AIMessage;

      // If the LLM makes a tool call, then we route to the "tools" node
      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      // Otherwise, we stop (reply to the user) using the special "__end__" node
      return "__end__";
    }

    // Define the function that calls the model
    async function callModel(state: typeof MessagesAnnotation.State) {
      const response = await model.invoke(state.messages);

      // We return a list, because this will get added to the existing list
      return { messages: [response] };
    }

    // Define a new graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
      .addNode("tools", toolNode)
      .addEdge("tools", "agent")
      .addConditionalEdges("agent", shouldContinue);

    // Finally, we compile it into a LangChain Runnable.
    const app = workflow.compile();

    // Use the agent
    const finalState = await app.invoke({
      messages: [new HumanMessage(req.body?.query)],
    });
    console.log(finalState.messages[finalState.messages.length - 1].content);

    // Now it's time to use!
    // const agentFinalState = await agent.invoke(
    //   //   { messages: [new HumanMessage("what is the current weather in sf")] },
    //   { messages: [new HumanMessage(req.body?.query)] },
    //   { configurable: { thread_id: "42" } }
    // );

    // console.log(
    //   agentFinalState.messages[agentFinalState.messages.length - 1].content
    // );

    // const agentNextState = await agent.invoke(
    //   //   { messages: [new HumanMessage("what about ny")] },
    //   { messages: [new HumanMessage(req.body?.query)] },

    //   { configurable: { thread_id: "42" } }
    // );

    // console.log(
    //   agentNextState.messages[agentNextState.messages.length - 1].content
    // );

    res.json({
      response: finalState.messages[finalState.messages.length - 1].content,
    });
  } catch (error) {
    next(error);
  }
};
