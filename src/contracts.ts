
export module ConfigurationContracts {

    interface Directories {
        Source: string;
        Build: string;
        App: string;
    }

    interface TypeScriptConfig {
        Development: string;
        Production: string;
    }

    interface Bundle {
        AppFile: string;
        BuildFile: string;
        Include: Array<string>;
        Exclude: Array<string>;
    }

    interface ServerConfiguration {
        Ip: string;
        Port: number;
        LiveReloadPort: number;
    }

    export interface GulpConfig {
        Directories: Directories;
        TypeScriptConfig: TypeScriptConfig;
        BundleConfig: Bundle;
        ServerConfig: ServerConfiguration;
        WebConfig: string;
        CfgVersion: number;
    }


}