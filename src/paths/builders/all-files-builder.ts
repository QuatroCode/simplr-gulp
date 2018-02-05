import { BuilderBase } from "../paths-builder-base";

export class AllFilesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string): string {
        if (name !== undefined) {
            return this.joinPaths(startPath, "**", "*" + name);
        } else {
            return this.joinPaths(startPath, "**", "*");
        }
    }
}
