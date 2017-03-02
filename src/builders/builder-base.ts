import { LoggerInstance } from '../utils/logger';


export interface BuildersList<TClass> {
    Production: TClass | undefined;
    Development: TClass | undefined;
}

export abstract class BuilderBase<TClass> {
    protected abstract build(production: boolean, builder: TClass, done?: Function): void | PromiseLike<any>;
    protected abstract initBuilder(production: boolean): TClass;

    public Build = (production: boolean, done: () => void) => {
        let compiler = this.getBuilder(production);
        let maybePromise = this.build(production, compiler, done);
        if (maybePromise !== undefined) {
            maybePromise.then(() => {
                done();
            }, error => {
                LoggerInstance.error(error);
                done();
            });
        }
    }

    protected getBuilder(production: boolean) {
        if (production) {
            if (this.builders.Production === undefined) {
                this.builders.Production = this.initBuilder(production);
            }
            return this.builders.Production;
        } else {
            if (this.builders.Development === undefined) {
                this.builders.Development = this.initBuilder(production);
            }
            return this.builders.Development;
        }
    }

    protected builders: BuildersList<TClass> = {
        Production: undefined,
        Development: undefined
    };
}
