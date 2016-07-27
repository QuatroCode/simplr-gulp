import DirectoriesBuilder from "./builders/directories-builder";
import AllFilesBuilder from "./builders/all-files-builder";
import OneFileBuilder from "./builders/one-file-builder";
import AllDirectoriesBuilder from "./builders/all-directories-builder";
import OneDirectoryBuilder from "./builders/one-directory-builder";


namespace Paths {
    export var Directories = new DirectoriesBuilder();
    export namespace Builders {
        export var AllFiles = new AllFilesBuilder();
        export var OneFile = new OneFileBuilder();
        export var AllDirectories = new AllDirectoriesBuilder();
        export var OneDirectory = new OneDirectoryBuilder();
    }
}

export default Paths;
