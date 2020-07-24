import * as is from 'predicates';
import {DENORMALIZE, NORMALIZE} from "./global";

export abstract class ValueExtractor<T> {
    abstract extract(value: T): Promise<any> | any;

    abstract toString(): string;
}

export namespace ValueExtractor {

    export class Property<T> extends ValueExtractor<T> {
        readonly path: Array<string | symbol>;

        constructor(...path: Property.Path) {
            if (path.length <= 0) {
                throw new Error('Property path must be longer than 0');
            }

            super();
            this.path = path;
            Object.freeze(this);
        }

        static create(...path: Property.Path) {
            return new Property(...path);
        }

        async extract(value: T): Promise<any> {
            let currentValue: any = value;
            for (const part of this.path) {
                if (is.object(currentValue)) {
                    currentValue = await currentValue[part];
                } else {
                    return undefined;
                }
            }
            return currentValue;
        }

        toString() {
            return `property "${this.path.join('.')}"`;
        }

        [NORMALIZE]() {
            return this.path;
        }

        static [DENORMALIZE](data: string[]) {
            return new Property(...data);
        }
    }

    export namespace Property {
        export type Path = Part[];
        export type Part = symbol | string;
    }
}
