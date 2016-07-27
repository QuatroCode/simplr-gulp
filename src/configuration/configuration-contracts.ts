export interface Directories {
    Source: string;
    Build: string;
    App: string;
}

export interface TypeScriptConfig {
    Development: string;
    Production: string;
}

export interface Bundle {
    AppFile: string;
    BuildFile: string;
    Include: Array<string>;
    Exclude: Array<string>;
}

export interface ServerConfiguration {
    Ip: string;
    Port: number;
    LiveReloadPort: number;
}

export interface GulpConfig {
    Directories: Directories;
    TypeScriptConfig: TypeScriptConfig;
    BundleConfig: Bundle;
    ServerConfig: ServerConfiguration;
    WebConfig: string | null;
    CfgVersion: number;
 }