<template>
    <!--    <div>form-material</div>-->
    <div class="side-panel">
        <div class="search-container">
            <bk-input
                clearable
                :placeholder="'组件名称'"
                :input-style="{ background: '#F5F7FA' }"
                :right-icon="'bk-icon icon-search'"
                v-model="searchValue"
                @enter="handleSearch"
                @clear="handleResetField">
            </bk-input>
        </div>
        <div class="fields-list-container">
            <div v-for="(group, index) in list" class="field-group" :key="index">
                <div class="group-name">
                    <i
                        class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                        :class="{
                            floded: group.isFolded
                        }"
                        @click="handleToggle(index,group.isFolded)" />
                    <span>{{ group.name }}</span>
                </div>
                <bk-divider />
                <draggable
                    class="list-wrap"
                    handle=".field-item"
                    tag="p"
                    :sort="false"
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
                        <li v-for="field in group.items" class="field-item drag-entry" :data-type="field.type" :key="field.type">
                            {{ field.name }}
                        </li>
                    </template>
                </draggable>
                <bk-exception
                    class="exception-wrap-item exception-part"
                    type="empty"
                    scene="part"
                    v-else>
                </bk-exception>
            </div>
        </div>
    </div>
</template>

<script>
    import draggable from 'vuedraggable'
    import { FIELDS_TYPES } from '../../constant/forms'

    export default {
        components: {
            draggable
        },
        data () {
            return {
                list: this.getGroupedFields(FIELDS_TYPES),
                searchValue: ''
            }
        },
        methods: {
            getGroupedFields (fieldsArr) {
                const layout = ['DESC', 'DIVIDER']
                const group = [
                    {
                        name: '布局控件',
                        items: [],
                        isFolded: false
                    },
                    {
                        name: '基础控件',
                        items: [],
                        isFolded: false
                    }
                ]
                fieldsArr.forEach(item => {
                    if (layout.includes(item.type)) {
                        group[0].items.push(item)
                    } else {
                        group[1].items.push(item)
                    }
                })
                return group
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
            handleSearch () {
                const tempField = FIELDS_TYPES.filter(item => item.name.includes(this.searchValue))
                this.list = this.getGroupedFields(tempField)
            },
            handleResetField () {
                this.list = this.getGroupedFields(FIELDS_TYPES)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.side-panel {
  position: relative;
  width: 300px;
  height: 100%;
  background: #fcfcfc;
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
  height: calc(100% - 44px);
  overflow: auto;
  width: 100%;
  background: #FFFFFF;
  box-shadow: 1px 0 0 0 #DCDEE5;
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
  .toggle-arrow {
    position: absolute;
    display: block;
    line-height: 40px;
    top: 0;
    left: 0;
    font-size: 24px;
    color: #979BA5;
    transition: all .1s linear;
    margin-right: 8px;
  //transform: rotate(-270deg);

    &.floded {
      transform: rotate(-90deg);
    }
  }
  span{
    display: block;
    margin-left: 8px;
  }
}
.search-container{
  padding: 12px;
}

/deep/ .bk-divider {
  margin: 0 !important;
}

.list-wrap {
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
//margin-top: 12px; padding: 12px;
}

.field-item {
  margin-bottom: 8px;
  padding: 0 4px 0 16px;
  width: 134px;
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  color: #63656e;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  cursor: move;
  user-select: none;

  &:hover {
    color: #3a84ff;
    border-color: #3a84ff;
  }
}

</style>
