import * as path from 'path';
import BuilderBase from '../paths-builder-base';

export default class OneFileBuilder extends BuilderBase {
    protected builder(startPath: string, name: string) {
        return path.join(startPath, name);
    }
}
