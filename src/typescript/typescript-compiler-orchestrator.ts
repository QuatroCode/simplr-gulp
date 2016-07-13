import TypescriptCompiler from './typescript-compiler';
import Configuration from '../configuration/configuration-loader';

class TypescriptCompilerOrchestrator {

    constructor() {

    }

    private get config() {
        return Configuration.GulpConfig.TypeScriptConfig;
    }

    private loadConfiguration() {
        
    }



}


export default new TypescriptCompilerOrchestrator();