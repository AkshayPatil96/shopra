# @repo/express-types

Global Express type augmentation for all services.

Adds `requestId` and `serviceName` fields to `Express.Request`.

## Usage
1. Add dependency in a service: `pnpm add @repo/express-types --filter <service>` (already added in workspace).
2. Ensure the service `tsconfig.json` either:
   - Does NOT restrict `compilerOptions.types` (default: ambient types auto-included), or
   - Explicitly includes it: `"types": ["node", "express", "@repo/express-types"]`.
3. No runtime import needed. Ambient declaration is loaded when TypeScript finds the package.

Optional: Use a request ID middleware to populate `req.requestId`.
