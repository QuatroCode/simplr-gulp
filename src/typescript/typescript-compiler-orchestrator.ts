import Configuration from '../configuration/configuration';

class TypescriptCompilerOrchestrator {

    constructor() {

    }

    private get config() {
        return Configuration.GulpConfig.TypeScriptConfig;
    }

    // private loadConfiguration() {
    // }



}


export default new TypescriptCompilerOrchestrator();