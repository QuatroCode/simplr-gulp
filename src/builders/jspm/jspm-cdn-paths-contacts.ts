export namespace CdnJsApi {

    export interface ItemAssetDto {
        version: string;
        files: Array<string>;
    }

    export interface ItemDto {
        name: string;
        latest: string;
        version: string;
        assets: Array<ItemAssetDto>;

    }

    export interface ResponseDto {
        results: Array<ItemDto>;
        total: number;
    }
}

export interface PackageDetails {
    OriginalName?: string;
    Name: string;
    Version: string;
}

export interface PackageItem {
    MapName: string;
    FullName: string;
    Details: PackageDetails;
}

export interface JspmPathsLists {
    Resolved: Array<PackageItem>;
    Unresolved: Array<PackageItem>;
    Paths: JspmPaths;
}
export type JspmPaths = { [fullName: string]: string };
