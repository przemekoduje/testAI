import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  imageSrc: { type: String, required: true }, // Link do obrazu lub Base64
  prompts: [
    {
      prompt: { type: String, required: true },
      response: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Story = mongoose.model("Story", StorySchema);
export default Story;
