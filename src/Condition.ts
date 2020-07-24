import * as is from 'predicates';
import {Predicate} from "predicates/types";
import {DENORMALIZE, NORMALIZE} from "./global";
import {ValueExtractor} from "./ValueExtractor";

export abstract class Condition<T = any> {
    abstract isSatisfied(value: T): Promise<boolean> | boolean;

    abstract toString(): string;
}

export function createConditionClass<TPredicate extends (...args: any[]) => Predicate<any>>(
    predicateFactory: TPredicate,
    descFactory?: (...args: Parameters<TPredicate>) => string,
    normalizeArgs?: (...args: Parameters<TPredicate>) => any,
    denormalizeArgs?: (...args: any[]) => Parameters<TPredicate>
): { new<T>(...args: Parameters<TPredicate>): Condition<T> } {
    const t = class<T> extends Condition<T> {
        private predicate: Predicate;

        readonly args: Parameters<TPredicate>;

        constructor(...args: Parameters<TPredicate>) {
            super();

            this.args = args;
            this.predicate = predicateFactory(...this.args);
            Object.freeze(this);
        }

        isSatisfied(value: T): Promise<boolean> | boolean {
            return this.predicate(value);
        }

        toString() {
            return descFactory ? descFactory(...this.args) : is.getDescription(this.predicate);
        }

        [NORMALIZE]() {
            return normalizeArgs ? normalizeArgs(...this.args) : this.args;
        }

        static [DENORMALIZE](data: any[]) {
            const newArgs: Parameters<TPredicate> = denormalizeArgs ? denormalizeArgs(...data) : data as Parameters<TPredicate>;
            return new t(...newArgs);
        }
    }

    return t;
}

function caseSensitiveString(isCaseSensitive: boolean) {
    return `(case ${isCaseSensitive ? '' : 'in'}sensitive)`;
}

export namespace Condition {
    export class OnValueExtractor<T> extends Condition<T> {
        constructor(readonly valueExtractor: ValueExtractor<T>, readonly condition: Condition<any>) {
            super();
        }

        async isSatisfied(value: T): Promise<boolean> {
            const extractedValue = await this.valueExtractor.extract(value);
            return this.condition.isSatisfied(extractedValue);
        }

        toString() {
            return `${this.valueExtractor.toString()} ${this.condition.toString()}`;
        }

        [NORMALIZE]() {
            return [this.valueExtractor, this.condition];
        }

        static [DENORMALIZE](data: [any, any]) {
            return new OnValueExtractor(data[0], data[1]);
        }
    }

    abstract class Aggregation<T> extends Condition<T> {
        readonly conditions: Condition[];

        constructor(...conditions: Condition[]) {
            super();
            this.conditions = conditions;
            Object.freeze(this);
        }

        protected conditionsToString() {
            return this.conditions.map(x => x.toString()).join(', ');
        }
    }

    export class All<T> extends Aggregation<T> {
        async isSatisfied(value: any): Promise<boolean> {
            for (const condition of this.conditions) {
                const result = await condition.isSatisfied(value);
                if (result === false) {
                    return false;
                }
            }
            return true;
        }

        toString(): string {
            return `All conditions meet: ${this.conditionsToString()}`;
        }
    }

    export class Any<T> extends Aggregation<T> {
        async isSatisfied(value: T): Promise<boolean> {
            for (const condition of this.conditions) {
                const result = await condition.isSatisfied(value);

                if (result === true) {
                    return true;
                }
            }
            return false;
        }

        toString() {
            return `Any condition meet: ${this.conditionsToString()}`;
        }
    }

    export const Equal = createConditionClass((value: any) => is.eq(value));
    export const NotEqual = createConditionClass(value => is.not(is.eq(value)));
    export const LessThanOrEqual = createConditionClass((value: any) => is.lessThanOrEqual(value));
    export const LessThan = createConditionClass((value: any) => is.lessThan(value));
    export const GreaterThanOrEqual = createConditionClass((value: any) => is.greaterThanOrEqual(value));
    export const GreaterThan = createConditionClass((value: any) => is.greaterThan(value))
    export const StartsWith = createConditionClass(
        (needle: string, isCaseSensitive: boolean = false) => (value: any) => {
            if (!is.string(value)) {
                return false;
            }
            let valueToCompare = value;
            let needleToCompare = needle;
            if (!isCaseSensitive) {
                valueToCompare = valueToCompare.toLowerCase();
                needleToCompare = needleToCompare.toLowerCase();
            }
            return is.startsWith(needleToCompare, valueToCompare);
        },
        (needle, isCaseSensitive = false) => {
            return `a string that starts with "${needle}" ${caseSensitiveString(isCaseSensitive)}`;
        }
    );
    export const EndsWith = createConditionClass(
        (needle: string, isCaseSensitive: boolean = false) => (value: any) => {
            if (!is.string(value)) {
                return false;
            }
            let valueToCompare = value;
            let needleToCompare = needle;
            if (!isCaseSensitive) {
                valueToCompare = valueToCompare.toLowerCase();
                needleToCompare = needleToCompare.toLowerCase();
            }
            return is.endsWith(needleToCompare, valueToCompare);
        },
        (needle, isCaseSensitive = false) => {
            return `a string that ends with "${needle}" ${caseSensitiveString(isCaseSensitive)}`;
        }
    );

    function normalizeRegExp(regexp: RegExp) {
        return [regexp.source, regexp.flags];
    }

    function denormalizeRegexp(source: string, flags: string): [RegExp] {
        return [new RegExp(source, flags)];
    }

    export const Matches = createConditionClass(
        (value: RegExp) => is.matches(value),
        undefined,
        normalizeRegExp,
        denormalizeRegexp
    );
    export const DoesNotMatch = createConditionClass(
        value => is.not(is.matches(value)),
        undefined,
        normalizeRegExp,
        denormalizeRegexp
    );

    export const In = createConditionClass((value: any[]) => is.in(value));
    export const NotIn = createConditionClass((value: any[]) => is.not(is.in(value)));

    export const Contains = createConditionClass(
        (needle: string, isCaseSensitive: boolean = false) => (value: any) => {
            if (!is.string(value)) {
                return false;
            }
            let valueToCompare = value;
            let needleToCompare = needle;
            if (!isCaseSensitive) {
                valueToCompare = valueToCompare.toLowerCase();
                needleToCompare = needleToCompare.toLowerCase();
            }
            return valueToCompare.includes(needleToCompare);
        },
        (needle, isCaseSensitive = false) => `contains "${needle}" ${caseSensitiveString(isCaseSensitive)}`
    );

    export const DoesNotContain = createConditionClass(
        (needle: string, isCaseSensitive: boolean = false) => (value: any) => {
            if (!is.string(value)) {
                return true;
            }
            let valueToCompare = value;
            let needleToCompare = needle;
            if (!isCaseSensitive) {
                valueToCompare = valueToCompare.toLowerCase();
                needleToCompare = needleToCompare.toLowerCase();
            }
            return !valueToCompare.includes(needleToCompare);
        },
        (needle, isCaseSensitive = false) => `does not contain "${needle}" ${caseSensitiveString(isCaseSensitive)}`
    );

    export class IsNull<T> extends Condition<T> {
        isSatisfied(value: T): Promise<boolean> | boolean {
            return is.null(value);
        }

        toString() {
            return 'is null';
        }
    }

    export class NotNull<T> extends Condition<T> {
        isSatisfied(value: T): Promise<boolean> | boolean {
            return is.not(is.null)(value);
        }

        toString() {
            return 'not null';
        }
    }
}