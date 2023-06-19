<template>
    <!--    <div>form-material</div>-->
    <div class="side-panel">
        <div class="search-container" v-bk-clickoutside="handleHideDropList">
            <bk-input
                clearable
                ext-cls="form-search-input"
                :placeholder="$t('请输入组件名称搜索')"
                :right-icon="'bk-icon icon-search'"
                v-model.trim="searchValue"
                @change="handleSearch"
                @clear="handleResetField"
                @keydown="handleKeydown"
                @focus="handleShowDropList"
                :native-attributes="{
                    spellcheck: false
                }">
            </bk-input>
            <div
                v-if="isShowList"
                class="search-dropdown-list">
                <ul
                    v-if="renderList.length"
                    ref="searchListContainer"
                    :style="{
                        'max-height': `${contentMaxHeight}px`
                    }"
                    class="outside-ul">
                    <li
                        v-for="(data, index) in renderList"
                        class="search-dropdown-list-item"
                        :class="{
                            hover: selectedIndex === index
                        }"
                        :key="index"
                        @click="handleSelect(data)">
                        {{data.name}}
                    </li>
                </ul>
                <ul
                    v-else
                    :style="{
                        'max-height': `${contentMaxHeight}px`
                    }"
                    class="outside-ul">
                    <li class="search-dropdown-list-item">
                        <span class="text">{{ $t('没有找到') }}</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="fields-list-container">
            <div v-for="(group, index) in list" class="field-group" :key="index">
                <bk-divider />
                <div class="group-name" v-if="group.items.length" @click="handleToggle(index,group.isFolded)">
                    <i
                        class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                        :class="{
                            floded: group.isFolded
                        }"
                    />
                    <span>{{ group.name }}</span>
                </div>
                <draggable
                    :class="['form-list-wrap', { 'disabled': disabled }]"
                    handle=".field-item"
                    filter=".not-available"
                    tag="p"
                    :sort="false"
                    :disabled="disabled"
                    :group="{
                        name: 'menu',
                        pull: 'clone',
                        put: false
                    }"
                    v-if="group.items.length"
                    :list="group.items"
                    :move="handleMove"
                    @end="handleEnd">
                    <template v-if="!group.isFolded">
                        <li
                            v-for="field in group.items"
                            v-bk-tooltips="{
                                disabled: !isFieldDisable(field.type),
                                content: $t('流程表单暂不支持布局类型控件')
                            }"
                            :class="['field-item drag-entry', { 'not-available': isFieldDisable(field.type) }]"
                            :data-type="field.type"
                            :key="field.type">
                            <i :class="['comp-icon',field.icon]"></i> <span>{{ field.name }}</span>
                        </li>
                    </template>
                </draggable>
            </div>
        </div>
    </div>
</template>

<script>
    import draggable from 'vuedraggable'
    import { FIELDS_TYPES } from 'shared/no-code/constant'
    import _ from 'lodash'
    const LAYOUT_GROUP = ['DESC', 'DIVIDER']
    const ADVANCED_GROUP = ['COMPUTE', 'SERIAL']
    const ALL_FIELDS = FIELDS_TYPES()

    export default {
        components: {
            draggable
        },
        props: {
            disabled: Boolean,
            pageType: String
        },
        data () {
            return {
                list: this.getGroupedFields(ALL_FIELDS),
                searchValue: '',
                isShowList: '',
                selectedIndex: 0,
                contentMaxHeight: 300,
                renderList: [],
                layoutGroup: LAYOUT_GROUP
            }
        },
        methods: {
            getGroupedFields (fieldsArr) {
                const group = [
                    {
                        name: this.$t('布局控件'),
                        items: [],
                        isFolded: false
                    },
                    {
                        name: this.$t('基础控件'),
                        items: [],
                        isFolded: false
                    },
                    {
                        name: this.$t('高级控件'),
                        items: [],
                        isFolded: false
                    }
                ]
                fieldsArr.forEach(item => {
                    if (LAYOUT_GROUP.includes(item.type)) {
                        group[0].items.push(item)
                    } else if (ADVANCED_GROUP.includes(item.type)) {
                        group[2].items.push(item)
                    } else {
                        group[1].items.push(item)
                    }
                })
                return group
            },
            isFieldDisable (type) {
                return this.pageType === 'FLOW' && [...LAYOUT_GROUP, ...ADVANCED_GROUP, 'RATE'].includes(type)
            },
            handleMove () {
                this.$emit('move')
            },
            handleEnd () {
                this.$emit('end')
            },
            handleToggle (index, isFolded) {
                this.$set(this.list[index], 'isFolded', !isFolded)
            },
            handleSearch: _.debounce(function () {
                if (!this.searchValue) {
                    this.handleResetField()
                    return
                }
                this.filterRenderList()
            }, 300),
            filterRenderList () {
                this.renderList = ALL_FIELDS.filter(item => item.name.includes(this.searchValue))
                this.isShowList = true
            },
            handleResetField () {
                this.list = this.getGroupedFields(ALL_FIELDS)
                this.isShowList = true
                this.handleHideDropList()
            },
            handleShowDropList () {
                if (this.searchValue) {
                    this.filterRenderList()
                }
            },
            handleHideDropList () {
                this.isShowList = false
                this.selectedIndex = 0
            },
            handleKeydown (value, e) {
                const keyCode = e.keyCode
                const length = this.renderList.length
                switch (keyCode) {
                    // 上
                    case 38:
                        e.preventDefault()
                        if (this.selectedIndex === -1 || this.selectedIndex === 0) {
                            this.selectedIndex = length - 1
                            this.$refs.searchListContainer.scrollTop = this.$refs.searchListContainer.scrollHeight
                        } else {
                            this.selectedIndex--
                            this.$nextTick(() => {
                                const curSelectNode = this.$refs.searchListContainer.querySelector('li.hover')
                                const offsetTop = curSelectNode.offsetTop
                                if (offsetTop < this.$refs.searchListContainer.scrollTop) {
                                    this.$refs.searchListContainer.scrollTop -= 32
                                }
                            })
                        }
                        break
                    // 下
                    case 40:
                        e.preventDefault()
                        if (this.selectedIndex < length - 1) {
                            this.selectedIndex++
                            this.$nextTick(() => {
                                const curSelectNode = this.$refs.searchListContainer.querySelector('li.hover')
                                const offsetTop = curSelectNode.offsetTop
                                // this.$refs.searchListContainer 上下各有 6px 的 padding
                                if (offsetTop > this.contentMaxHeight - 2 * 6) {
                                    // 每一个 item 是 32px height
                                    this.$refs.searchListContainer.scrollTop += 32
                                }
                            })
                        } else {
                            this.selectedIndex = 0
                            this.$refs.searchListContainer.scrollTop = 0
                        }
                        break
                    case 13:
                        e.preventDefault()
                        const item = this.renderList[this.selectedIndex]
                        if (item) {
                            this.handleSelect(item)
                        }
                        break
                    default:
                        break
                }
            },
            handleSelect (data) {
                this.handleHideDropList()
                this.searchValue = data.name
                const group = [
                    {
                        name: this.$t('布局控件'),
                        items: [],
                        isFolded: false
                    },
                    {
                        name: this.$t('基础控件'),
                        items: [],
                        isFolded: false
                    }
                ]
                this.layoutGroup.includes(data.type) ? group[0].items.push(data) : group[1].items.push(data)
                this.list = group
            }

        }
    }
</script>
<style lang="postcss">
    .form-search-input input {
        background-color: #F5F7FA;
        border-radius: 2px;
        border: 1px solid #fff;
        &:focus {
            border: 1px solid #3a84ff;
        }
    }
</style>
<style lang="postcss" scoped>
@import "@/css/mixins/scroller";
@import "@/css/mixins/ellipsis";
.side-panel {
  position: relative;
  height: 100%;
  width: 300px;
  box-shadow: 1px 0 0 0 #DCDEE5;
  z-index: 1;
}

.panel-title {
  padding: 0 16px;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  background: #ffffff;
  border-top: 1px solid #dcdee5;
  border-bottom: 1px solid #dcdee5;
}

.fields-list-container {
  height: calc(100% - 56px);
  overflow: auto;
  width: 100%;
  background: #FFFFFF;
  box-shadow: 1px 0 0 0 #DCDEE5;
  @mixin scroller;
}

.group-name {
  padding: 0 12px;
  height: 40px;
  font-size: 12px;
  color: #313238;
  font-weight: Bold;
  position: relative;
  display: flex;
  align-items: center;
  &:hover{
    cursor: pointer;
  }
  .toggle-arrow {
    position: absolute;
    display: block;
    line-height: 40px;
    top: 0;
    left: 0;
    font-size: 24px;
    color: #63656E;
    transition: all .1s linear;
    margin-right: 8px;

    &.floded {
      transform: rotate(-90deg);
    }
  }
  span {
    display: block;
    position: absolute;
    top: 0;
    left: 28px;
    line-height: 40px;
  }
}
.search-container{
  padding: 10px;
  position: relative;
  .search-dropdown-list {
    position: absolute;
    left: 12px;
    right: 12px;
    margin-top: 5px;
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    background-color: #fff;
    z-index: 100;
    overflow-y: hidden;
    .outside-ul {
      @mixin scroller;
      padding: 0;
      margin: 0;
      list-style: none;
      overflow-y: auto;
      padding: 6px 0;
    }
    .search-dropdown-list-item {
      position: relative;
      width: 100%;
      border-left: #c4c6cc;
      border-right: #c4c6cc;
      background-color: #fff;
      cursor: pointer;
      height: 32px;
      line-height: 32px;
      padding: 0 10px;
      color: #63656E;
      font-size: 12px;
      .text {
        @mixin ellipsis 100%;
        em {
          font-style: normal;
          color: #3a84ff;
        }
      }
      &:first-child {
        border-top: #c4c6cc;
      }
      &:last-child {
        border-bottom: #c4c6cc;
      }
      &:hover,
      &.hover {
        background-color: #e1ecff;
      }
    }
  }
  .bk-tooltip.search-dropdown {
    display: block;
    &>.bk-tooltip-ref {
      display: block;
    }
  }
}

/deep/ .bk-divider {
  margin: 0 !important;
}

.form-list-wrap {
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  padding: 12px;
  &.disabled {
    .field-item {
        cursor: inherit;;
    }
  }
}

.field-item {
  margin-bottom: 8px;
  padding: 0 4px 0 12px;
  width: 134px;
  height: 32px;
  line-height: 32px;
  color: #63656e;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  font-size: 0;
  span{
     font-size: 12px;
  }
  &:not(.not-available):hover {
    color: #3a84ff;
    border-color: #3a84ff;
  }
  &.not-available {
    color: #c4c6cc;
    border-color: #dcdee5;
    cursor: not-allowed;
  }
}

.comp-icon{
  font-size: 16px;
  padding-right: 8px;
}
</style>
