

export class ReloadFiles {
    constructor(private filesNames: Array<string>) { }
    get FilesNames() {
        return this.filesNames;
    }
}

export class ReloadPage {
    constructor() { }
}