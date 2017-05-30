import * as Formatters from "tslint/lib/formatters";
import { RuleFailure } from "tslint";
import { LoggerInstance } from '../../utils/logger';

export class TsLintFormatter extends Formatters.AbstractFormatter {
    public format(failures: RuleFailure[]) {
        let lines = new Array<string>();
        failures.forEach(failure => {
            let position = failure.getStartPosition().getLineAndCharacter();
            let line = `${failure.getFileName()}[${position.line + 1}, ${position.character + 1}]: ${failure.getFailure()} (${failure.getRuleName()})`;
            lines.push(line);
            LoggerInstance.warn(line);
        });
        return JSON.stringify(lines);
    }
}
