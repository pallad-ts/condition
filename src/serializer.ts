import {Serializer, simpleNormalizer} from "alpha-serializer";
import {ValueExtractor} from "./ValueExtractor";
import {NORMALIZE, DENORMALIZE} from "./global";
import {Condition} from "./Condition";

export function setupSerializer(serializer: Serializer) {

    const normalizer = serializer.normalizer;

    function setup(name: string, clazz: {
        new(...args: any[]): any,
        [DENORMALIZE]?: (value: any) => any
    }) {
        normalizer.registerNormalization({
            name,
            clazz: clazz as any,
            normalizer: (value: any) => {
                if (NORMALIZE in value) {
                    return value[NORMALIZE]();
                }
                return simpleNormalizer(value);
            },
            denormalizer: clazz[DENORMALIZE]
        });
    }

    setup('ValueExtractor/Property', ValueExtractor.Property);

    for (const [name, clazz] of Object.entries(Condition)) {
        if ('isSatisfied' in clazz.prototype) {
            setup(`Condition/${name}`, clazz);
        }
    }
}

