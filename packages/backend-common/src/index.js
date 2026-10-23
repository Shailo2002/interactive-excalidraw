exports.JWT_SECRET = process.env.JWT_SECRET;
if (!exports.JWT_SECRET) throw new Error("JWT_SECRET is required");
