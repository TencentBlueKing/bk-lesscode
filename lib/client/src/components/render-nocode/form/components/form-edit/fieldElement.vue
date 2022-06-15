<template>
    <div
        :class="['field-element', { 'half-row': field.layout === 'COL_6', 'disabled': disabled }]"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        @click="$emit('action', 'edit')">
        <div class="actions-area" v-show="!disabled && curfield.key === field.key">
            <span class="name-area">{{`${curfield.type}-${curfield.key}`}}</span>
            <span class="icon-area"><i class="bk-icon icon-copy" @click.stop="$emit('action', 'copy')"></i></span>
            <span class="icon-area"> <i class="bk-drag-icon bk-drag-shanchu" @click.stop="$emit('action', 'delete')"></i></span>
        </div>
        <div class="field-container">
            <div class="mask"></div>
            <field-item :field="field"></field-item>
        </div>
    </div>
</template>
<script>
    import FieldItem from '@/components/nocode-form/fieldItem.vue'

    export default {
        name: 'FieldElement',
        components: {
            FieldItem
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            curfield: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean
        },
        data () {
            return {
                isHover: false
            }
        }
    }
</script>
<style lang="postcss" scoped>
.field-element {
  position: relative;
  display: inline-block;
  padding: 12px;
  width: 100%;
  min-height: 86px;
  border: 1px solid transparent;
  vertical-align: top;
  transition: background 0.2s ease-in-out, border 0.2s ease-in-out;
  &:not(.disabled) {
    cursor: move;
  }
  &:first-child {
    margin-top: 24px;
  }
  &:hover {
    background: #fafbfd;
    border-color: #dcdee5;
  }
  &.half-row {
    width: 50%;
    &:nth-of-type(2){
      margin-top: 24px;
    }
  }
}
.field-container {
  position: relative;
  padding-bottom: 24px;
  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
  }
  .field-form-item {
    margin-top: 0;
    width: 100%;
  }
}
.drag-icon-wrapper {
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  color: #c4c6cc;
  z-index: 2;
}

.actions-area {
  position: absolute;
  left: 0;
  top: -25px;
  z-index: 99999;
  display: inline-flex;
  span{
    display: block;
    text-align: center;
    margin-right: 2px;
    background: #3A84FF;
    color: #fff;
    border-radius: 2px;
  }
  .icon-area{
    width: 20px;
    height: 20px;
  }

  .name-area{
    display: block;
    padding:0 4px ;
    font-size: 12px;
    line-height: 20px;
  }
  &:hover{
     cursor: pointer;
  }
}

.slide-left-enter,
.slide-left-leave-to {
  right: -36px;
}
.slide-left-enter-to,
.slide-leave {
  right: 0;
}
.slide-left-enter-active,
.slide-left-leave-active {
  transition: right 0.2s ease-in-out;
}
</style>
