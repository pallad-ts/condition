import {JSONAdapter, Serializer, StandardNormalizer} from "alpha-serializer";
import {setupSerializer} from "@src/serializer";
import {Condition} from "@src/Condition";
import * as is from "predicates";
import {ValueExtractor} from "@src/ValueExtractor";
import {cases} from "./conditionsTestCases";

describe('serializer', () => {
    let serializer: Serializer;

    beforeEach(() => {
        serializer = new Serializer(
            new JSONAdapter(),
            new StandardNormalizer()
        );

        setupSerializer(serializer);
    });

    describe.each<[string, Condition, any[]]>(
        cases.map(([name, condition, validValues, invalidValues]) => [
            'Condition/' + name,
            condition,
            validValues.concat(invalidValues)
        ])
    )('%s', (name, condition, testValues) => {
        let newCondition: Condition<any>;
        beforeEach(() => {
            newCondition = serializer.deserialize(
                serializer.serialize(condition)
            );
        });

        it('snapshot', () => {
            expect(serializer.serialize(condition))
                .toMatchSnapshot();
        })

        it('has proper serialized name', () => {
            const result = serializer.normalizer.normalize(condition);
            expect(result['@type'])
                .toEqual(name);
        });

        it.each(
            testValues.map(x => [x])
        )('works the same after serialization and deserialization: %s', async value => {
            const result = newCondition.isSatisfied(value);
            const originalResult = condition.isSatisfied(value);
            if (is.promiseLike(result)) {
                return expect(result)
                    .resolves
                    .toEqual(await originalResult);
            }
            expect(result)
                .toEqual(originalResult);
        });

        it('remains the same description', () => {
            expect(newCondition.toString())
                .toEqual(condition.toString());
        })
    });
});