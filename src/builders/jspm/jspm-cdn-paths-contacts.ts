export namespace CdnJsApi {
    export interface ItemAssetDto {
        version: string;
        files: string[];
    }

    export interface ItemDto {
        name: string;
        latest: string;
        version: string;
        assets: ItemAssetDto[];
    }

    export interface ResponseDto {
        results: ItemDto[];
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
    Resolved: PackageItem[];
    Unresolved: PackageItem[];
    Paths: JspmPaths;
}
export type JspmPaths = { [fullName: string]: string };
