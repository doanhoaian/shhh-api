const { z } = require("zod");

const createConfessionSchema = z.object({
    user_id: z.string({ message: "Invalid user ID format" }),
    school_id: z.number({ message: "Invalid school ID format" }),
    content: z.string({ message: "Content is required" }).min(3)
});

module.exports = { createConfessionSchema };