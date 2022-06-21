<template>
    <div
        ref="root"
        id="lesscodeOperationArea"
        :class="$style['operation-area']">
        <div :class="$style['operation-wraper']">
            <render-nocode
                v-show="operation === 'edit'"
                :style="renderStyles"
            />
            <component
                v-if="operation !== 'edit'"
                :is="com"
                :nocode-type="nocodeType"
                v-bind="$attrs"
                :style="oprationItemStyles"
            />
        </div>
    </div>
</template>
<script>
    import RenderNocode from '@/components/render-nocode/index'
    import PageSetting from '@/views/index/components/operation-area/components/page-setting'
    import PageJson from '@/views/index/components/operation-area/components/page-json'

    export default {
        name: '',
        components: {
            RenderNocode
        },
        props: {
            operation: {
                type: String,
                required: true
            },
            nocodeType: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                renderStyles: {},
                oprationItemStyles: {
                    height: '100%'
                }
            }
        },
        computed: {
            com () {
                const comMap = {
                    setting: PageSetting,
                    jsonSource: PageJson
                }
                return comMap[this.operation]
            }
        }
    }
</script>
<style lang="postcss" module>
@import "@/css/mixins/scroller";

.operation-area {
  height: 100%;
  min-width: min-content;
  /*padding: 0 20px; */
  /* margin: 20px 0; */
  overflow: auto;
  @mixin scroller;

  .operation-wraper {
    height: 100%;
    min-width: min-content;
  }
}
</style>
