<template>
    <div
        :class="{
            [$style['draw-layout']]: !isDataManagePage,
            [$style['page-data-manage-layout']]: isDataManagePage && !hideRightSlot,
            [$style['page-nocode-layout']]: isNocodeForm,
            [$style['is-left-collapsed']]: isLeftCollapse,
            [$style['is-right-collapsed']]: isRightCollapse
        }">
        <div :class="[$style['layout-left'],{ [$style['page-nocode-left-layout']]: isNocodeForm }]" v-if="!isDataManagePage">
            <slot name="left" />
        </div>
        <div
            id="lesscodeDrawContent"
            :class="[$style['layout-center'],{ [$style['nocode-layout-center']]: isNocodeForm }]">
            <slot />
        </div>
        <div v-if="!hideRightSlot" :class="$style['layout-right']">
            <slot name="right" />
        </div>
        <div
            v-if="!isDataManagePage"
            :class="[$style['collapsed-left-btn'],{ [$style['collapsed-nocode-left-btn']]: isNocodeForm }]"
            v-bk-tooltips.right="{
                content: $t('查看所有组件'),
                disabled: !isLeftCollapse
            }"
            @click="handleToggleLeft">
            <i class="bk-drag-icon bk-drag-angle-left" />
        </div>
        <div
            v-if="!hideRightSlot && !isDataManagePage"
            :class="$style['collapsed-right-btn']"
            v-bk-tooltips.right="{
                content: $t('查看组件配置'),
                disabled: !isRightCollapse
            }"
            @click="handleToggleRight">
            <i class="bk-drag-icon bk-drag-angle-left" />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        name: '',
        props: {
            pageType: String,
            hideRightSlot: Boolean
        },
        data () {
            return {
                isLeftCollapse: false,
                isRightCollapse: false
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            nocodeType () {
                return this.pageDetail.nocodeType || this.pageType || ''
            },
            isNocodeForm () {
                return ['FORM', 'FLOW'].includes(this.nocodeType)
            },
            isDataManagePage () {
                return ['FORM_MANAGE', 'FLOW_MANAGE', 'MARKDOWN'].includes(this.nocodeType)
            }
        },
        methods: {
            handleToggleLeft () {
                this.isLeftCollapse = !this.isLeftCollapse
            },
            handleToggleRight () {
                this.isRightCollapse = !this.isRightCollapse
            }
        }
    }
</script>
<style lang="postcss" module>
    @import "@/css/mixins/scroller";
    $layoutLeftWidth: 340px;
    $layoutRightWidth: 300px;

    .draw-layout{
        position: relative;
        padding-right: 300px;
        padding-left: 340px;
        transition: all .1s;
        &.is-left-collapsed{
            padding-left: 0;
            .layout-left {
                width: 0;
                overflow: hidden;
            }
            .page-nocode-left-layout{
              width: 0 !important;
              overflow: hidden;
            }
            .collapsed-left-btn{
                left: 0;
                :global(.bk-drag-angle-left){
                    transform: rotate(180deg);
                }
            }
        }
        &.is-right-collapsed{
            padding-right: 0;
            .layout-right{
                width: 0;
                overflow: hidden;
                height: calc(100vh - 116px);
            }
            .collapsed-right-btn{
                right: 0;
                :global(.bk-drag-angle-left){
                    transform: rotate(0deg);
                }
            }
        }
        .layout-left,
        .layout-right{
            transition: all .15s;
        }
        .layout-left{
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: $layoutLeftWidth;
            background: #fff;
            box-shadow: 2px 4px 4px 0 rgb(0 0 0 / 10%);
        }
        .layout-right{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: $layoutRightWidth;
            background: #FFF;
            box-shadow: -2px 4px 4px 0px rgba(0,0,0,0.1);

        }
        .layout-center{
            position: relative;
            height: 100%;
        }
        .collapsed-left-btn,
        .collapsed-right-btn{
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            top: 50%;
            width: 16px;
            height: 50px;
            font-size: 12px;
            color: #fff;
            background: #C4C6CC;
            transform: translateY(-50%);
            cursor: pointer;
            &:hover {
                background: #3A84FF;
            }

            :global(.bk-drag-angle-left){
                transition: transform .15s;
            }
        }
        .collapsed-left-btn{
            left: 340px;
            border-radius: 0 8px 8px 0;
            :global(.bk-drag-angle-left) {
                transform: rotate(0deg);
            }
        }
        .collapsed-right-btn{
            right: 300px;
            border-radius: 8px 0 0 8px;
            :global(.bk-drag-angle-left) {
                transform: rotate(180deg);
            }
        }
    }
    .page-data-manage-layout{
      /* max-width: 100vw; */
      position: relative;
      padding-right:  $layoutRightWidth;
      transition: all .1s;

      &.is-right-collapsed{
        padding-right: 0;
        .layout-right{
          width: 0 !important;
          overflow: hidden;
          height: calc(100vh - 116px);
        }
        .collapsed-right-btn{
          right: 0 !important;
          :global(.bk-drag-angle-left){
            transform: rotate(0deg);
          }
        }
      }
      .layout-right{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: $layoutRightWidth !important;
        background: #FFF;
        box-shadow: -2px 4px 4px 0px rgba(0,0,0,0.1);
      }
      .layout-right{
        transition: all .15s;
      }

      .layout-center{
        position: relative;
        height: 100%;
      }
      .collapsed-right-btn{
        right: 300px !important;
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 50%;
        width: 16px;
        height: 50px;
        font-size: 12px;
        color: #fff;
        background: #C4C6CC;
        transform: translateY(-50%);
        cursor: pointer;
        &:hover {
          background: #3A84FF;
        }

        :global(.bk-drag-angle-left){
          transition: transform .15s;
        }
      }
      .collapsed-right-btn{
        border-radius: 8px 0 0 8px;
        :global(.bk-drag-angle-left) {
          transform: rotate(180deg);
        }
      }
    }
    .page-nocode-left-layout{
      width: 300px !important;
      height: 100%;
      overflow: auto;
      background: #3a84ff;
      border: 1px solid #DCDEE5;
      box-shadow: 1px 0 0 0 #DCDEE5;
      @mixin scroller;
    }
    .page-nocode-layout{
      /* max-width: 100vw; */
      padding-left: 300px !important;
      &.is-left-collapsed{
        padding-left: 0 !important;
        .collapsed-left-btn{
          left: 0 !important;
          :global(.bk-drag-angle-left){
            transform: rotate(180deg);
          }
        }
      }

      &.is-right-collapsed{
        padding-right: 0 !important;
        .layout-right{
          width: 0 !important;
          overflow: hidden;
          height: calc(100vh - 116px);
        }
        .collapsed-right-btn{
          right:  0 !important;
          :global(.bk-drag-angle-left){
            transform: rotate(0deg);
          }
        }
      }

    }
    .collapsed-nocode-left-btn{
      left: 300px !important;
    }
    .nocode-collapsed-right-btn{
    }

    .nocode-layout-center{
        padding: 20px;
        overflow: hidden;
    }
</style>
