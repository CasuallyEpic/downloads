# Unlimited API Service on Vercel

This is a complete setup for hosting unlimited TypeScript APIs on Vercel.

## Project Structure

```
/
├── api/                    # All API endpoints go here
│   ├── hello.ts           # GET /api/hello
│   ├── users/
│   │   ├── index.ts       # GET/POST /api/users
│   │   └── [id].ts        # GET/PUT/DELETE /api/users/[id]
│   ├── tsconfig.json      # TypeScript config for API
│   └── vercel.json        # Vercel deployment config
├── package.json           # Project dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

The dev server will start at `http://localhost:3000`

### 4. Creating New API Endpoints

Create any `.ts` file inside the `api/` folder:

**Simple endpoint:** `api/hello.ts`
```typescript
import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: "Hello!" });
}
```
→ Access at `GET /api/hello`

**Nested endpoint:** `api/users/profile.ts`
→ Access at `GET /api/users/profile`

**Dynamic routes:** `api/posts/[id].ts`
```typescript
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query; // Get [id] from URL
  res.status(200).json({ postId: id });
}
```
→ Access at `GET /api/posts/123` → `id = "123"`

**Multiple methods:**
```typescript
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    // Handle GET
  } else if (req.method === "POST") {
    // Handle POST
  }
}
```

## Deployment

### Deploy to Production
```bash
npm run deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Available Endpoints (Examples)

- `GET /api/hello` - Simple hello world
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/123` - Get user by ID
- `PUT /api/users/123` - Update user
- `DELETE /api/users/123` - Delete user

## Environment Variables

Add environment variables in Vercel dashboard or `.env.local`:
```
DATABASE_URL=your_database_url
API_KEY=your_api_key
```

Access in your API:
```typescript
const dbUrl = process.env.DATABASE_URL;
```

## Key Features

✅ Unlimited API endpoints  
✅ TypeScript support  
✅ Automatic scaling  
✅ Zero-cost on Vercel free tier (with limitations)  
✅ Environment variables support  
✅ Dynamic routes with `[param]`  
✅ Hot reload in development  

## Limits & Notes

- **Free tier**: 100 seconds per function, 12 seconds on Pro  
- **Function size**: Up to 50MB (configured in vercel.json)  
- **Supported methods**: GET, POST, PUT, DELETE, PATCH, etc.
- **Response size**: Depends on plan

## Troubleshooting

If APIs aren't working:
1. Check `tsconfig.json` is present in `api/` folder
2. Ensure files are in `api/` folder with `.ts` extension
3. Run `npm run build` to check for TypeScript errors
4. Check Vercel logs: `npm run deploy` shows any errors

## More Info

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Node Runtime](https://vercel.com/docs/functions/serverless-functions)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
