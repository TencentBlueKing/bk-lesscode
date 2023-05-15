<template>
    <div class="render-drag-item" :class="displayClass">
        <div class="component-icon">
            <i class="bk-drag-icon" :class="data.icon" />
        </div>
        <div class="component-name"
            v-enStyle="'word-break: break-word'"
            :title="$t(data.displayName).length >= 12 ? $t(data.displayName) : ''">{{ $t(data.displayName) }}</div>
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
