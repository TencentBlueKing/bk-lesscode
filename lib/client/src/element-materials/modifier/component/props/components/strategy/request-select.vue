<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <bk-select style="width: 100%" v-model="renderValue" :loading="isLoading" :clearable="true" searchable @change="handleChange" @toggle="toggleVisible">
        <template v-if="payload.isGroup">
            <bk-option-group
                v-for="(group, index) in renderList"
                :name="group.name"
                :key="index">
                <bk-option v-for="option in group.children"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-option-group>
        </template>
        <template v-else>
            <bk-option
                v-for="option in renderList"
                :key="option.id"
                :id="option.id"
                :name="option.name">
            </bk-option>
        </template>
        <div v-if="payload.slotLink" slot="extension" @click="toLink(payload.slotLink)" style="cursor: pointer;">
            <i class="bk-icon icon-plus-circle"></i>{{payload.slotText}}
        </div>
    </bk-select>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'

    import { mapGetters } from 'vuex'

    export default {
        props: {
            defaultValue: {
                type: [String, Number],
                required: true
            },
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            describe: {
                type: Object,
                required: true
            },
            change: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                renderList: [],
                renderValue: '',
                payload: {},
                isLoading: false
            }
        },
        computed: {
            ...mapGetters('drag', ['curSelectedComponentData'])
        },
        watch: {
            defaultValue: {
                handler (v) {
                    this.renderValue = v
                },
                immediate: true
            }
        },
        created () {
            const renderDescribe = cloneDeep(this.describe)
            this.payload = renderDescribe.payload || {}
            this.freshList()
        },
        methods: {
            toggleVisible (open) {
                open && this.freshList()
            },
            async freshList () {
                try {
                    const { url, key = 'id', value = 'name', isGroup = false, groupChildren = 'children' } = this.payload
                    if (!url) {
                        this.renderList = []
                        return
                    }
                    this.isLoading = true
                    const res = await this.$http.get(url)

                    // 分组时处理children
                    const getChildren = (children) => {
                        if (!isGroup) return []
                        return (children || []).map(child => ({
                            ...child,
                            id: child[key],
                            name: child[value]
                        }))
                    }

                    // 考虑是否分组
                    this.renderList = (res.data?.data || res.data || res || []).map(item => ({
                        ...item,
                        id: item[key],
                        name: item[value],
                        children: getChildren(item[groupChildren])
                    }))
                    console.log(this.renderList, res.data?.data || res.data || [])
                } catch (e) {
                    this.$bkMessage({
                        message: e.message,
                        theme: 'error'
                    })
                } finally {
                    this.isLoading = false
                }
            },
            handleChange (val) {
                this.change(this.name, val, this.type)
            },
            toLink (url) {
                window.open(url, '_blank')
            }
        }
    }
</script>
