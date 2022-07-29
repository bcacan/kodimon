// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { pokeApiRouter } from "./pokeApi";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("pokeApi.", pokeApiRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
