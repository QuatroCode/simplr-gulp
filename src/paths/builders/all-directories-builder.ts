import * as path from 'path';
import BuilderBase from '../paths-builder-base';

export default class AllDirectoriesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string | undefined) {
        if (name !== undefined) {
            return path.join(startPath, "**", name, "**", "*");
        } else {
            return path.join(startPath, "**", "*");
        }
    }
}
