import * as fs from "fs";
import * as jspm from "jspm";
import * as path from "path";

import { TaskBase } from "../task-base";
import { Configuration } from "../../configuration/configuration";
import { Paths } from "../../paths/paths";
import { LoggerInstance } from "../../utils/logger";

export class BundleTask extends TaskBase {
    public Name: string = "Bundle";
    public Description: string = "Bundles the app libs with jspm bundle";

    public TaskFunction = (production: boolean, done: () => void) => {
        const { BundleConfig } = Configuration.GulpConfig;

        const appFile = path
            .join(Configuration.GulpConfig.Directories.App, BundleConfig.AppFile)
            .split(path.sep)
            .join("/");

        let bundleCmd = appFile;
        const buildDest = Paths.Builders.OneFile.InBuild(BundleConfig.BuildFile);

        for (let i = 0; i < BundleConfig.Include.length; i++) {
            bundleCmd += ` + ${BundleConfig.Include[i]}`;
        }

        for (let i = 0; i < BundleConfig.Exclude.length; i++) {
            bundleCmd += ` - ${BundleConfig.Exclude[i]}`;
        }

        // Exclude css files
        bundleCmd += ` - [app/**/*.css!]`;

        const builder = new jspm.Builder();

        LoggerInstance.log(`jspm bundle ${bundleCmd} ${buildDest}`);
        builder
            .bundle(bundleCmd, {
                minify: true,
                mangle: true
            })
            .then((output: { source: string; sourceMap: string; modules: string }) => {
                fs.writeFileSync(buildDest, output.source);
                done();
            })
            .catch((e: any) => {
                done();
                LoggerInstance.info("Please make sure that you have installed jspm packages ('jspm install')");
                throw e;
            });
    };
}
