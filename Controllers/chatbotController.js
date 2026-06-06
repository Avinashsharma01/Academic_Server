import catchAsync from "../utils/catchAsync.js";
import { getAssistantReply } from "../Services/chatbotService.js";

export const chatWithAssistant = catchAsync(async (req, res) => {
  const { message, history } = req.body;
  const result = await getAssistantReply({ message, history });

  res.status(200).json({
    status: "success",
    reply: result.reply,
    model: result.modelUsed,
  });
});