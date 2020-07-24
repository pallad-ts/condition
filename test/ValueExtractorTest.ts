import {ValueExtractor} from "@src/ValueExtractor";

describe('ValueExtractor', () => {
    describe('Property', () => {
        const VALUE_ON_PATH = 'test';

        it.each<[ValueExtractor<any>, any, string]>([
            [
                new ValueExtractor.Property('foo'),
                {foo: 'test'},
                'property "foo"'
            ],
            [
                new ValueExtractor.Property('foo', 'bar'),
                {
                    foo: {
                        bar :VALUE_ON_PATH
                    }
                },
                'property "foo.bar"'
            ],
            [
                new ValueExtractor.Property('foo', 'bar'),
                {
                    get foo() {
                        return Promise.resolve({
                            bar: VALUE_ON_PATH
                        })
                    }
                },
                'property "foo.bar"'
            ],
            [
                new ValueExtractor.Property('foo', 'bar', 'test'),
                {
                    get foo() {
                        return Promise.resolve({
                            get bar() {
                                return Promise.resolve({
                                    test: VALUE_ON_PATH
                                })
                            }
                        })
                    }
                },
                'property "foo.bar.test"'
            ]
        ])('retrieves value at given key path with promise supporte', async (extractor, validValue, desc) => {
            await expect(extractor.extract(validValue))
                .resolves
                .toEqual(VALUE_ON_PATH);

            await expect(extractor.extract({}))
                .resolves
                .toBeUndefined();

            expect(extractor.toString())
                .toEqual(desc);
        });
    });

    it('throw an error when too short path provided', () => {
        expect(() => {
            new ValueExtractor.Property()
        })
            .toThrowErrorMatchingSnapshot();
    });

    it('creating through factory', () => {
        const path = ['foo', 'bar'];
        expect(new ValueExtractor.Property(...path))
            .toEqual(ValueExtractor.Property.create(...path));
    });
});