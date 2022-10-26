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
    <div class="modifier-props-icon-container">
        <bk-select
            style="width: 100%"
            searchable
            :value="value"
            @change="handleChange">
            <bk-option
                v-for="route in list"
                :id="route.key"
                :name="route.name"
                :key="route.key">
            </bk-option>
        </bk-select>
    </div>
</template>

<script>
    import { mapGetters, mapState } from 'vuex'

    export default {
        props: {
            defaultValue: {
                type: String,
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
            change: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                value: '',
                list: []
            }
        },
        computed: {
            ...mapGetters('page', ['platform']),
            ...mapState('route', ['layoutPageList'])
        },
        created () {
            this.list = this.layoutPageList.reduce((acc, page) => {
                if (page.pageType === this.platform) {
                    acc.push({
                        name: page.pageName,
                        key: `/${page.layoutPath.split('/')[1]}/${page.path}`
                    })
                }
                return acc
            }, [])
            if (this.value === '') {
                this.value = this.list[0].key
            }
        },
        methods: {
            handleChange (val) {
                if (val) {
                    this.change(this.name, val, this.type)
                } else {
                    this.change(this.name, '', this.type)
                }
            }
        }
    }
</script>
