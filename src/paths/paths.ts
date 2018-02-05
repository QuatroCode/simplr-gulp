import { DirectoriesBuilder } from "./builders/directories-builder";
import { AllFilesBuilder } from "./builders/all-files-builder";
import { OneFileBuilder } from "./builders/one-file-builder";
import { AllDirectoriesBuilder } from "./builders/all-directories-builder";
import { OneDirectoryBuilder } from "./builders/one-directory-builder";

export namespace Paths {
    export const Directories = new DirectoriesBuilder();

    export namespace Builders {
        export const AllFiles = new AllFilesBuilder();
        export const OneFile = new OneFileBuilder();
        export const AllDirectories = new AllDirectoriesBuilder();
        export const OneDirectory = new OneDirectoryBuilder();
    }
}
