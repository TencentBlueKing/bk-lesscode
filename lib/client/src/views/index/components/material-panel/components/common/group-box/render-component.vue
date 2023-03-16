<template>
    <div class="field-item drag-entry" :class="displayClass">
        <i :class="['bk-drag-icon', 'comp-icon', data.icon]"></i> <span>{{ data.displayName }}</span>
        <slot />
    </div>
</template>
<script>
    export default {
        name: '',
        props: {
            data: Object
        },
        created () {
            this.displayClass = ''
            if (this.data.renderStyles && this.data.renderStyles.display) {
                this.displayClass = this.data.renderStyles.display
            }
        }
    }
</script>
