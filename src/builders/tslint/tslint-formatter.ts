import * as Lint from "tslint/lib/lint";
import Logger from '../../utils/logger';

export default class ErrorHandler extends Lint.Formatters.AbstractFormatter {
    public format(failures: Lint.RuleFailure[]) {
        let lines = new Array<string>();
        failures.forEach(failure => {
            let position = failure.getStartPosition().getLineAndCharacter();
            let line = `${failure.getFileName()}[${position.line + 1}, ${position.character + 1}]: ${failure.getFailure()} (${failure.getRuleName()})`;
            lines.push(line);
            Logger.warn(line);
        });
        return JSON.stringify(lines);
    }
}