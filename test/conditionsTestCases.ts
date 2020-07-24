import {Condition} from "@src/Condition";
import {ValueExtractor} from "@src/ValueExtractor";

export const cases: [string, Condition, any[], any[], string][] = [
    [
        'All',
        new Condition.All(
            new Condition.Contains('foo'),
            new Condition.Contains('bar')
        ),
        ['foobar'],
        ['foo', 'bar'],
        'All conditions meet: contains "foo" (case insensitive), contains "bar" (case insensitive)'
    ],
    [
        'Any',
        new Condition.Any(
            new Condition.Contains('foo'),
            new Condition.Contains('bar')
        ),
        ['foobor', 'feebar'],
        ['fo', 'ba'],
        'Any condition meet: contains "foo" (case insensitive), contains "bar" (case insensitive)'
    ],
    [
        'Equal',
        new Condition.Equal(10),
        [10],
        [39],
        'equal to 10',
    ],
    [
        'NotEqual',
        new Condition.NotEqual(10),
        [39, 100],
        [10],
        'not equal to 10'
    ],
    [
        'LessThanOrEqual',
        new Condition.LessThanOrEqual(10),
        [10, -10],
        [10.1, 100],
        'less than or equal 10'
    ],
    [
        'LessThan',
        new Condition.LessThan(10),
        [9, -10],
        [10, 100],
        'less than 10'
    ],
    [
        'GreaterThanOrEqual',
        new Condition.GreaterThanOrEqual(10),
        [10, 100],
        [9, -10],
        'greater than or equal 10'
    ],
    [
        'GreaterThan',
        new Condition.GreaterThan(10),
        [10.1, 100],
        [10, -10],
        'greater than 10'
    ],
    [
        'StartsWith',
        new Condition.StartsWith('foo'),
        ['foobar', 'FOOBAR', 'foolink'],
        ['afoo', 'bar'],
        'a string that starts with "foo" (case insensitive)'
    ],
    [
        'StartsWith',
        new Condition.StartsWith('foo', true),
        ['foobar', 'foolink'],
        ['afoo', 'bar', 'FOOBAR', {}],
        'a string that starts with "foo" (case sensitive)'
    ],
    [
        'EndsWith',
        new Condition.EndsWith('foo'),
        ['barfoo', 'foo', 'BARFOO'],
        ['fooa', 'bar', {}],
        'a string that ends with "foo" (case insensitive)'
    ],
    [
        'EndsWith',
        new Condition.EndsWith('foo', true),
        ['barfoo', 'foo'],
        ['fooa', 'bar', 'BARFOO'],
        'a string that ends with "foo" (case sensitive)'
    ],
    [
        'Matches',
        new Condition.Matches(/a{1,2}/),
        ['ba', 'baa'],
        ['co', 'be'],
        'a string that matches regexp /a{1,2}/'
    ],
    [
        'DoesNotMatch',
        new Condition.DoesNotMatch(/a{1,2}/),
        ['co', 'be'],
        ['ba', 'baa'],
        'not a string that matches regexp /a{1,2}/'
    ],
    [
        'In',
        new Condition.In([1, 2]),
        [1, 2],
        [0, -1],
        'one of values: 1, 2'
    ],
    [
        'NotIn',
        new Condition.NotIn([1, 2]),
        [0, -1],
        [1, 2],
        'not one of values: 1, 2'
    ],
    [
        'Contains',
        new Condition.Contains('foo'),
        ['foobar', 'FOOBAR'],
        ['barfo', {}],
        'contains "foo" (case insensitive)'
    ],
    [
        'Contains',
        new Condition.Contains('foo', true),
        ['foobar'],
        ['barfo', 'FOOBAR', {}],
        'contains "foo" (case sensitive)'
    ],
    [
        'DoesNotContain',
        new Condition.DoesNotContain('foo'),
        ['barfo', {}],
        ['foobar', 'FOOBAR'],
        'does not contain "foo" (case insensitive)'
    ],
    [
        'DoesNotContain',
        new Condition.DoesNotContain('foo', true),
        ['barfo', 'FOOBAR', {}],
        ['foobar'],
        'does not contain "foo" (case sensitive)'
    ],
    [
        'IsNull',
        new Condition.IsNull(),
        [null],
        [undefined, {}],
        'is null'
    ],
    [
        'NotNull',
        new Condition.NotNull(),
        [undefined, {}],
        [null],
        'not null'
    ],
    [
        'OnValueExtractor',
        new Condition.OnValueExtractor(
            new ValueExtractor.Property('test'),
            new Condition.Equal(10)
        ),
        [{
            get test() {
                return Promise.resolve(10)
            }
        }],
        [{}],
        'property "test" equal to 10'
    ]
];