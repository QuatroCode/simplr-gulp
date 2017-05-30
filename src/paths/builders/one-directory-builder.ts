import { BuilderBase } from '../paths-builder-base';

export class OneDirectoryBuilder extends BuilderBase {
    protected builder(startPath: string, name: string | undefined) {
        if (name != null) {
            return this.joinPaths(startPath, name);
        } else {
            return startPath;
        }
    }
}
