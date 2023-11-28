/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { defineComponent, ref, watch } from '@vue/composition-api'
import { VNode } from 'vue'
import MenuItem from '../editor/menu/index.vue'
import { generatorMenu, generatorHelpMenu } from '../../../../../../shared/util'
import './base-menu-template.css'

export default defineComponent({
    components: {
        MenuItem
    
    },
    props: {
        menuList: Array,
        menuKey: String,
        platform: String,
        hasChild: {
            type: Boolean,
            default: true
        },
        showIcon: {
            type: Boolean,
            default: false
        },
        draggableName: {
            type: String,
            default: 'top-col'
        },
        titleName: {
            type: String,
            default: window.i18n.t('导航菜单')
        },
        hasBlank: {
            type: Boolean,
            default: false
        },
        lastFew: {
            type: Number,
            default: 1
        }
    },
  
    setup (props, { emit }) {
        const localMenuList = ref([])

        const showContent = ref(true)

        const triggerChange = () => {
            emit('change', props.menuKey, localMenuList.value)
        }
      
        const handleRemove = (index) => {
            const localList = [...localMenuList.value]
            localList.splice(index, 1)
            localMenuList.value = localList
            triggerChange()
        }
        const handleChange = (value, index: number) => {
            localMenuList.value.splice(index, 1, value)
            triggerChange()
        }
        
        const handleAdd = () => {
            if (props.menuKey === 'helpMenuList') {
                localMenuList.value.push(generatorHelpMenu())
            } else {
                localMenuList.value.push(props.platform === 'PC' ? generatorMenu() : generatorMenu('apps-o'))
            }
            triggerChange()
        }
      
        watch(
            () => props.menuList,
            (menuList) => {
                localMenuList.value = menuList
            },
            {
                immediate: true
            }
        )
      
        return {
            localMenuList,
            handleRemove,
            handleChange,
            handleAdd,
            triggerChange,
            showContent
        }
    },

    render (): VNode {
        return (
            <div class="project-top-menu-modifier">
                <div
                    class="menu-title"
                    onClick={() => {
                        this.showContent = !this.showContent
                    }}>
                    <i
                        class={{
                            'bk-icon icon-angle-down': true,
                            close: !this.showContent
                        }}
                    ></i>
                    <span> { this.titleName }</span>
                </div>
                {this.showContent && <div>
                    <div class="menu-wrapper">
                        <vue-draggable
                            class="group-list"
                            ghost-class="menu-ghost-item"
                            list={this.localMenuList}
                            handle=".item-drag"
                            onChange={this.triggerChange}
                            group={{ name: this.draggableName }}>
                            <transition-group type="transition" name="flip-list">
                                {this.localMenuList.map((menu, index) => (<menu-item
                                    data={menu}
                                    key={menu.id}
                                    last-one={this.localMenuList.length === this.lastFew}
                                    onOn-delete={() => this.handleRemove(index)}
                                    onOn-change={(value) => this.handleChange(value, index)}
                                    show-icon={this.showIcon}
                                    has-child={this.hasChild}
                                    has-blank={this.hasBlank}
                                    platform={this.platform}>
                                </menu-item>))}
                            </transition-group>
                        </vue-draggable>
                    </div>
                    <div class="footer">
                        {this.localMenuList.length <= 0 ? <div class="add-help-menu">
                            <bk-button size="small" icon="plus-circle" text onClick={this.handleAdd}>{ this.$t('添加帮助菜单项') }</bk-button>
                        </div> : <bk-button size="small" text onClick={this.handleAdd}>{ this.$t('继续添加') }</bk-button>
                        }
                    </div>
                </div>}
            </div>
        )
    }
})
