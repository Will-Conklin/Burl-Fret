declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface ErrnoException extends Error {
    code?: string;
  }
}

declare const __dirname: string;

declare const process: {
  env: NodeJS.ProcessEnv;
  cwd(): string;
  exit(code?: number): never;
  uptime(): number;
  version: string;
  memoryUsage(): { heapUsed: number; heapTotal: number };
  on(event: string, listener: (...args: any[]) => void): void;
};

interface NodeRequire {
  (id: string): any;
  cache: Record<string, unknown>;
  resolve(id: string): string;
}

declare const require: NodeRequire;

declare module 'path' {
  export function join(...parts: string[]): string;
  export function extname(p: string): string;
  export function basename(p: string, ext?: string): string;
}

declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function readdirSync(path: string, options?: any): any;
  export function statSync(path: string): { isFile(): boolean; isDirectory(): boolean };
}

declare module 'http' {
  export interface Server {
    listen(port: number, cb?: () => void): Server;
    on(event: string, listener: (...args: any[]) => void): void;
    close(callback?: (err?: Error) => void): void;
  }
}

declare module 'express' {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  export type Application = {
    use(...args: any[]): any;
    get(...args: any[]): any;
    listen(port: number, cb?: () => void): import('http').Server;
  };

  interface ExpressModule {
    (): Application;
    json(): any;
  }

  const express: ExpressModule;
  export default express;
}

declare module 'dotenv' {
  export function config(options?: any): void;
}

declare module 'winston' {
  export interface Logger {
    info(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    debug(...args: any[]): void;
  }

  export const format: any;
  export const transports: any;
  export function createLogger(options?: any): Logger;

  const winston: {
    createLogger: typeof createLogger;
    format: typeof format;
    transports: typeof transports;
    Logger: Logger;
  };

  export default winston;
}

declare module 'discord.js' {
  export class Collection<K, V> extends Map<K, V> {}

  export class Client {
    constructor(options?: any);
    user?: any;
    ws: { status: number; ping: number };
    guilds: { cache: Map<any, any> };
    users: { cache: Map<any, any> };
    commands: Collection<string, any>;
    config: any;
    once(event: string, listener: (...args: any[]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    login(token?: string): Promise<void>;
  }

  export const GatewayIntentBits: Record<string, number>;
  export const Partials: Record<string, number>;
  export const PermissionFlagsBits: Record<string, number | bigint>;

  export type CacheType = any;
  export type Interaction<Cached extends CacheType = CacheType> = any;
  export type ChatInputCommandInteraction = any;
  export type Message = any;

  export class REST {
    constructor(options?: any);
    setToken(token: string): this;
  }

  export const Routes: any;

  export class SlashCommandBuilder {
    [key: string]: any;
  }

  export class EmbedBuilder {
    [key: string]: any;
  }

  export class DiscordAPIError extends Error {
    code?: number;
    method?: string;
    url?: string;
    status?: number;
  }

  export interface EmbedAuthorOptions {
    [key: string]: any;
  }

  export interface EmbedFooterOptions {
    [key: string]: any;
  }

  export interface APIEmbedField {
    [key: string]: any;
  }
}

declare const console: {
  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
};
