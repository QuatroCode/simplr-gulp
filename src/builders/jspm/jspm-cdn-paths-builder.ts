import * as path from "path";
import * as fs from "fs";
import * as https from "https";
import * as url from "url";
import * as jspm from "jspm";

import { Paths } from "../../paths/paths";
import { Logger } from "../../utils/logger";

import { CdnJsApi, PackageItem, JspmPaths, JspmPathsLists } from "./jspm-cdn-paths-contacts";

const CDN_API = {
    Hostname: "api.cdnjs.com",
    Pathname: "libraries",
    Query: { fields: "assets,version", search: undefined } as {
        fields: string;
        search: string | undefined;
    }
};

export class JspmCdnPaths {
    public async Start(done: () => void): Promise<void> {
        const packagesList = this.getPackagesList();
        const results = await this.startDownload(packagesList);
        if (results != null && Object.keys(results).length !== 0) {
            await this.saveResultToFile(results.Paths);
        }
        this.printResults(results);
        done();
    }

    private printResults(results: JspmPathsLists): void {
        const logger = Logger.withType("JSPM");
        if (results.Resolved.length > 0) {
            logger.info(
                [`Successfully resolved ${results.Resolved.length} path${results.Resolved.length > 1 ? "s" : ""}:`]
                    .concat(
                        results.Resolved.map(
                            (item, index) =>
                                `${this.resultPrefix(index, results.Resolved.length)} ${item.FullName}: '${results.Paths[item.FullName]}'`
                        )
                    )
                    .join("\r\n")
            );
        }

        if (results.Unresolved.length > 0) {
            logger.warn(
                [`Failed to resolved ${results.Unresolved.length} path${results.Unresolved.length > 1 ? "s" : ""}:`]
                    .concat(
                        results.Unresolved.map((item, index) => `${this.resultPrefix(index, results.Unresolved.length)} ${item.FullName}`)
                    )
                    .join("\r\n")
            );
        }
    }

    private resultPrefix(index: number, itemsLength: number): string {
        return `\t\t\t ${index === itemsLength - 1 ? "└─" : "├─"}`;
    }

    private async saveResultToFile(paths: JspmPaths): Promise<{}> {
        const logger = Logger.withType("JSPM");
        return new Promise(resolve => {
            const pathname = [Paths.Directories.Source, "configs", "jspm.config.production.js"].join("/");
            logger.info(`Generating file '${pathname}'`);
            const data = [
                "/* Generated by simplr-gulp */",
                "SystemJS.config({",
                "    paths: " + JSON.stringify(paths, null, 4),
                "});"
            ].join("\r\n");
            fs.writeFile(pathname, data, err => {
                if (err) {
                    logger.error(err.message);
                }
                resolve();
            });
        });
    }

    private async startDownload(
        packagesList: PackageItem[],
        results: JspmPathsLists = { Resolved: [], Unresolved: [], Paths: {} }
    ): Promise<JspmPathsLists> {
        return new Promise<JspmPathsLists>(async resolve => {
            if (packagesList.length > 0) {
                const item = packagesList.shift()!;
                const cdnLink = await this.getCdnLink(item);
                if (cdnLink !== undefined) {
                    results.Resolved.push(item);
                    results.Paths[item.FullName] = cdnLink.replace(/^https?\:/i, "");
                } else {
                    results.Unresolved.push(item);
                }
                resolve(await this.startDownload(packagesList, results));
            } else {
                resolve(results);
            }
        });
    }

    private async getCdnLink(packageItem: PackageItem, splited: boolean = false): Promise<string | undefined> {
        return new Promise<string | undefined>(resolve => {
            const logger = Logger.withType(`JSPM [${packageItem.FullName}]`);

            const requestDetails = {
                protocol: "https:",
                hostname: CDN_API.Hostname,
                pathname: CDN_API.Pathname,
                query: CDN_API.Query
            };
            requestDetails.query.search = packageItem.Details.Name;

            const location = url.format(requestDetails);

            logger.info(`Downloading '${location}'`);

            const request = https.get(location, response => {
                logger.info(`Response '${response.statusCode}' (${response.statusMessage}).`);
                let allData = "";
                response.on("data", (data: string) => {
                    allData += data;
                });
                response.on("end", async () => {
                    let parsedJson: CdnJsApi.ResponseDto | undefined;
                    try {
                        parsedJson = JSON.parse(allData);
                    } catch (err) {
                        logger.error(`Sorry, something wrong with response data from ${CDN_API.Hostname}. Please report a bug.`);
                    }

                    if (parsedJson !== undefined) {
                        logger.info(`Downloaded and parsed '${parsedJson.total}' result${parsedJson.total > 1 ? "s" : ""}.`);
                        if (parsedJson.total > 0) {
                            const link = await this.getLinkFromResponseByVersion(packageItem, parsedJson, splited);
                            if (link !== undefined) {
                                logger.info(`Cdn link successfully resolved.`);
                                logger.info(`'${link}'`);
                            } else {
                                logger.warn(`Cannot resolve cdn link with version ${packageItem.Details.Version}.`);
                            }
                            resolve(link);
                        } else {
                            if (!splited) {
                                const splitedName = this.tryToSplitPackageName(packageItem.Details.Name);
                                if (splitedName !== undefined) {
                                    logger.info(`Trying to use splited package name: '${splitedName}'`);
                                    const splitedPackageItem = {
                                        FullName: packageItem.FullName,
                                        MapName: packageItem.MapName,
                                        Details: {
                                            OriginalName: packageItem.Details.Name,
                                            Name: splitedName,
                                            Version: packageItem.Details.Version
                                        }
                                    };
                                    const link = this.getCdnLink(splitedPackageItem, true);
                                    resolve(link);
                                } else {
                                    resolve(undefined);
                                }
                            } else {
                                resolve(undefined);
                            }
                        }
                    } else {
                        resolve(undefined);
                    }
                });
            });

            request.on("error", (err: any) => {
                logger.error(err.message);
                resolve(undefined);
            });
        });
    }

    private tryToResolveSplitedPackage(
        packageItem: PackageItem,
        assetIndex: number,
        found: CdnJsApi.ItemDto,
        link: string | undefined = undefined
    ): undefined | string {
        const logger = Logger.withType(`JSPM [${packageItem.FullName}]`);

        const asset = found.assets[assetIndex];
        const searchingFiles = new Array<string>();
        const originalName = (packageItem.Details.OriginalName || packageItem.Details.Name).toLowerCase();
        // Searching .min.js or .js by order priority
        searchingFiles.push(`${originalName}.min.js`);
        searchingFiles.push(`${originalName}.js`);

        const foundFile = searchingFiles.find(searchingFile => asset.files.findIndex(file => searchingFile === file) !== -1);
        if (foundFile !== undefined) {
            logger.info(`File '${foundFile}' found in '${found.name}@${asset.version}'`);
            return this.buildCdnLinkWithCustomFile(link || found.latest, foundFile);
        }
        return undefined;
    }

    private tryToSplitPackageName(name: string): string | undefined {
        const splited = name.split("-");
        if (splited.length === 2) {
            return splited[0];
        }
        return undefined;
    }

    private checkIfFileExist(files: string[], link: string, fileName: string): { Found: boolean; Link: string } {
        const resultObj = {
            Found: false,
            Link: link
        };

        files.forEach(originalName => {
            if (originalName === fileName) {
                resultObj.Found = true;
                return false;
            } else if (originalName.toLocaleLowerCase() === fileName) {
                resultObj.Found = true;
                const parsedFile = path.parse(link);
                resultObj.Link = `${parsedFile.dir}/${originalName}`;
                return false;
            }
        });
        return resultObj;
    }

    private async getLinkFromResponseByVersion(
        packageItem: PackageItem,
        responseDto: CdnJsApi.ResponseDto,
        splited: boolean
    ): Promise<string | undefined> {
        const logger = Logger.withType(`JSPM [${packageItem.FullName}]`);

        return new Promise<string | undefined>(async resolve => {
            const found = responseDto.results.find(x => x.name === packageItem.Details.Name);
            if (found !== undefined) {
                if (found.version === packageItem.Details.Version) {
                    logger.info(`Version '${found.version}' found.`);
                    if (!splited) {
                        resolve(found.latest);
                    } else {
                        const foundAsset = found.assets.findIndex(x => x.version === packageItem.Details.Version);
                        if (foundAsset !== -1) {
                            resolve(this.tryToResolveSplitedPackage(packageItem, foundAsset, found));
                        } else {
                            resolve(undefined);
                        }
                    }
                } else {
                    logger.info(
                        `Not targeting the latest version '${found.version}', trying to find version '${packageItem.Details.Version}'`
                    );
                    const assetIndex = found.assets.findIndex(x => x.version === packageItem.Details.Version);
                    if (assetIndex !== -1) {
                        const asset = found.assets[assetIndex];
                        logger.info(`Version '${packageItem.Details.Version}' found.`);
                        const link = this.buildCdnLink(found.latest, found.version, packageItem.Details.Version);
                        if (link !== undefined) {
                            if (splited) {
                                resolve(this.tryToResolveSplitedPackage(packageItem, assetIndex, found, link));
                            } else {
                                let checkFile = path.parse(link).base;
                                logger.info(`Checking file '${checkFile}'`);
                                let results = this.checkIfFileExist(asset.files, link, checkFile);
                                if (!results.Found && checkFile.indexOf("-") !== -1) {
                                    logger.info(`Checking file '${checkFile}'`);
                                    checkFile = checkFile.split("-").join("");
                                    results = this.checkIfFileExist(asset.files, link, checkFile);
                                }

                                if (results.Found) {
                                    logger.info(`File successfully found.`);
                                    resolve(results.Link);
                                } else {
                                    logger.info(`File does not found in '${packageItem.Details.Version}' version.`);
                                    resolve(undefined);
                                }
                            }
                        } else {
                            logger.error(
                                [
                                    "Failed to resolve cdn link. Please report this error.",
                                    `--- ERROR DETAILS ---`,
                                    `LatestLink: ${found.latest}`,
                                    `LatestVersion: ${found.version}`,
                                    `TargetVersion:  ${packageItem.Details.Version}`,
                                    `---------------------`
                                ].join("\r\n ")
                            );
                            resolve(link);
                        }
                    } else {
                        resolve(undefined);
                    }
                }
            } else {
                logger.info(`Package '${packageItem.Details.Name}' with original name was not found. Searching file in assets.`);
                let resolved = false;

                for (let i = 0; i < responseDto.results.length; i++) {
                    const item = responseDto.results[i];
                    const foundAsset = item.assets.findIndex(x => x.version === packageItem.Details.Version);
                    if (foundAsset !== -1) {
                        const resolvedItem = this.tryToResolveSplitedPackage(packageItem, foundAsset, item);
                        if (resolvedItem !== undefined) {
                            resolved = true;
                            resolve(resolvedItem);
                            break;
                        }
                    }
                }

                if (!resolved) {
                    resolve(undefined);
                }
            }
        });
    }

    private buildCdnLinkWithCustomFile(latestLink: string, targetFile: string): string {
        const currentFileName = path.parse(latestLink).base;
        return latestLink.replace(currentFileName, targetFile);
    }

    private buildCdnLink(latestLink: string, latestVersion: string, targetVersion: string): string | undefined {
        const linkDetails = latestLink.split(latestVersion);
        if (linkDetails.length === 2) {
            const link = linkDetails[0] + targetVersion + linkDetails[1];
            return link;
        } else {
            return undefined;
        }
    }

    private getPackagesList(registry: string = "npm"): PackageItem[] {
        const prefix = `${registry}:`;
        const packagesList = new Array<PackageItem>();

        jspm.setPackagePath(".");
        const packagesMap: {
            [name: string]: string;
        } = jspm.Loader().getConfig().map;

        for (const name in packagesMap) {
            if (packagesMap.hasOwnProperty(name)) {
                const fullName = packagesMap[name];
                if (fullName.indexOf(prefix) === 0) {
                    const details = fullName.slice(prefix.length, fullName.length).split("@");
                    packagesList.push({
                        MapName: name,
                        FullName: fullName,
                        Details: {
                            Name: details[0],
                            Version: details[1]
                        }
                    });
                }
            }
        }

        return packagesList;
    }
}
