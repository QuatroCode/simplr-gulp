import BuilderBase from '../paths-builder-base';

export class AllDirectoriesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string | undefined) {
        if (name !== undefined) {
            return this.joinPaths(startPath, "**", name, "**", "*");
        } else {
            return this.joinPaths(startPath, "**", "*");
        }
    }
}
