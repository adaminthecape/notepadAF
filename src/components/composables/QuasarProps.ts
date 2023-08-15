import { defineProps } from 'vue';

export type QSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useQuasarProps()
{
    const size = defineProps<QSize>();
    const icon = defineProps<string>();
    const color = defineProps<string>();
    const flat = defineProps<boolean>();
    const dense = defineProps<boolean>();

    return {
        size,
        icon,
        color,
        flat,
        dense
    }
}