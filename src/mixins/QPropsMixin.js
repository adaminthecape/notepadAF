export default {
    props: {
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
        }
    },
    computed: {
        allQProps()
        {
            const props = ['size', 'icon', 'color', 'flat', 'dense'];

            return props.reduce(
                (agg, prop) =>
                {
                    agg[prop] = this[prop];

                    return agg;
                },
                {}
            );
        }
    }
};