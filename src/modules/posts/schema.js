const { z } = require("zod");

const permissionTypes = ["all", "school_only", "none"];

const createPostSchema = z.object({
    user_id: z.string({ message: "Invalid user ID format" }),
    school_id: z.coerce.number({ message: "Invalid school ID format" }),
    content: z.string({ message: "Content is required" }).min(1),
    comment_permission: z.enum(permissionTypes).default("all"),
    view_permission: z.enum(permissionTypes).default("all")
});

module.exports = { createPostSchema, permissionTypes };