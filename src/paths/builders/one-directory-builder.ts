import * as path from 'path';
import BuilderBase from '../paths-builder-base';

export default class OneDirectoryBuilder extends BuilderBase {
    protected builder(startPath: string, name: string | undefined) {
        if (name != null) {
            return path.join(startPath, name);
        } else {
            return startPath;
        }
    }
}
