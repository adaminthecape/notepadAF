<template>
  <div>
    <slot />
  </div>
</template>

<script>
/**
 * Take whatever is passed as attributes and provide it to all descendant components
 */
export default {
  provide()
  {
    return {
      defaultQuasarProps: { ...this.$attrs }
    };
  }
};
</script>
