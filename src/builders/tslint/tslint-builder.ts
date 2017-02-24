import BuilderBase from '../builder-base';
import * as gulp from 'gulp';
import Paths from '../../paths/paths';
import tslint from 'gulp-tslint';
import TsLintFormatter from './tslint-formatter';

class TslintBuilder extends BuilderBase<void> {

    protected build(production: boolean, builder: void, done: () => void) {

        let tsSrc = gulp.src([
                Paths.Builders.AllFiles.InSourceApp(".ts*"),
                `!${Paths.Builders.AllFiles.InSourceApp("d.ts")}`
            ]);
        tsSrc = tsSrc.pipe(
            tslint({
                formatter: TsLintFormatter
            }))
            .on("end", done);
    }


    protected initBuilder(production: boolean) {
        return;
    }

}

export default new TslintBuilder();
