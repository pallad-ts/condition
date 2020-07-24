import {Condition} from "@src/Condition";
import * as is from 'predicates';
import {cases} from "./conditionsTestCases";

describe('Condition', () => {
    describe.each(cases)
    ('%s', (_name, condition, satisfiedValues, notSatifisfiedValues, desc) => {
        it.each(
            satisfiedValues.map(x => [x])
        )('satisfied by: %s', value => {
            const result = condition.isSatisfied(value);

            if (is.promiseLike(result)) {
                return expect(result)
                    .resolves
                    .toEqual(true);
            }

            expect(result)
                .toEqual(true);
        });

        it.each(
            notSatifisfiedValues.map(x => [x])
        )('not satisfied by: %s', value => {
            const result = condition.isSatisfied(value);

            if (is.promiseLike(result)) {
                return expect(result)
                    .resolves
                    .toEqual(false);
            }
            expect(result)
                .toEqual(false);
        });

        it('toString', () => {
            expect(condition.toString())
                .toEqual(desc);
        })
    });
});