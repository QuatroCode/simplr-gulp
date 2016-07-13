import * as path from 'path';
import BuilderBase from '../paths-builder-base';

export default class AllDirectoriesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        return path.join(startPath, "**", name, "**", "*");
    }
}
