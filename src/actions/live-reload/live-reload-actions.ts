export class ReloadFiles {
    constructor(private filesNames: string[]) {}

    public get FilesNames(): string[] {
        return this.filesNames;
    }
}

export class ReloadPage {}
