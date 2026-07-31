import type { WorkerEnv } from "./env.js";

export type AppEnv = {
  Bindings: Partial<WorkerEnv>;
  Variables: {
    userId?: string;
    role?: string;
    requestId?: string;
  };
};

export type AppBindings = AppEnv;
