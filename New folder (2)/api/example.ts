import { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Example API file
 * 
 * Usage: GET /api/example
 * 
 * You can write your API logic here without worrying about routing or CORS.
 * The index.ts router will automatically:
 * - Route requests to this file
 * - Handle CORS headers
 * - Handle errors
 * - Parse query/body parameters
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Your API logic here
  
  if (req.method === "GET") {
    return res.status(200).json({
      message: "Hello from example API",
      path: req.url,
      method: req.method,
    });
  }

  if (req.method === "POST") {
    const { name } = req.body;
    return res.status(201).json({
      message: "Created successfully",
      data: { name },
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
