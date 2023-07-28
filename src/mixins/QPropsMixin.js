export const qProps = {
    size: {
        type: String,
        default: undefined
    },
    icon: {
        type: String,
        default: undefined
    },
    color: {
        type: String,
        default: undefined
    },
    flat: {
        type: Boolean,
        default: false
    },
    dense: {
        type: Boolean,
        default: false
    },
    allQProps: {
        type: Object,
        default: () => (['size', 'icon', 'color', 'flat', 'dense'].reduce(
            (agg, prop) =>
            {
                agg[prop] = this[prop];

                return agg;
            },
            {}
        ))
    }
};

export function importQProps()
{
    Object.entries(qProps).forEach(([key, value]) =>
    {
        console.log({ key, value });
    });
}

export default {
    qProps,
    importQProps
};