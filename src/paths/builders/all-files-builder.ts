import * as path from 'path';
import BuilderBase from '../paths-builder-base';

export default class AllFilesBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        if (name !== undefined) {
            return path.join(startPath, '**', '*' + name);
        } else {
            return path.join(startPath, '**', '*');
        }
    }
}
