import TaskBase from '../task-base';
import * as jspm from 'jspm';
import Configuration from '../../configuration/configuration';
import Paths from '../../paths/paths';
import * as path from 'path';
import Logger from '../../utils/logger';
import * as fs from 'fs';

export default class BundleTask extends TaskBase {

    Name = "Bundle";

    Description = "Bundles the app libs with jspm bundle";

    TaskFunction = (production: boolean, done: () => void) => {

        let { BundleConfig } = Configuration.GulpConfig;

        let appFile = path.join(Configuration.GulpConfig.Directories.App, BundleConfig.AppFile).split(path.sep).join("/");

        let bundleCmd = appFile,
            buildDest = Paths.Builders.OneFile.InBuild(BundleConfig.BuildFile);

        for (let i = 0; i < BundleConfig.Include.length; i++) {
            bundleCmd += ` + ${BundleConfig.Include[i]}`;
        }

        for (let i = 0; i < BundleConfig.Exclude.length; i++) {
            bundleCmd += ` - ${BundleConfig.Exclude[i]}`;
        }

        // Exclude css files
        bundleCmd += ` - [app/**/*.css!]`;

        let builder = new jspm.Builder();

        Logger.log(`jspm bundle ${bundleCmd} ${buildDest}`);
        builder.bundle(bundleCmd, {
            minify: true,
            mangle: true
        }).then((output: { source: string, sourceMap: string, modules: string }) => {
            fs.writeFileSync(buildDest, output.source);
            done();
        }).catch((e: any) => {
            done();
            Logger.info("Please make sure that you have installed jspm packages ('jspm install')");
            throw e;
        });
    }

}