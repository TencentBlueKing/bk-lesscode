<template>
    <section
        v-bkloading="{ isLoading }"
    >
        <section class="data-base-tools">
            <bk-input
                clearable
                class="filter-database-name"
                :placeholder="$t('请输入数据库名')"
                right-icon="bk-icon icon-search"
                v-model="dataBaseName"
            ></bk-input>
            <bk-button
                theme="primary"
                @click="handleShowAdd"
            >
                {{ $t('新增') }}
            </bk-button>
        </section>

        <ul class="database-item-list" v-if="displayDataBaseList.length">
            <li
                v-for="item in displayDataBaseList"
                :key="item.dbName"
                :class="{
                    active: item.dbName === dataBaseInfo.dbName,
                    'database-item': true
                }"
                @click="setActiveDataBase(item)"
            >
                <span class="database-item-name" v-tooltips="item.dbName">
                    <i class="bk-drag-icon bk-drag-data-source-manage"></i>
                    <span>{{ item.dbName }}</span>
                </span>
            </li>
        </ul>
        <empty-status v-else :type="emptyType" @clearSearch="handlerClearSearch" :part="false"></empty-status>
        <render-sideslider
            :title="$t('新增数据库')"
            :is-show="formStatus.showAdd"
            :form="formStatus.editForm"
            :is-saving="formStatus.isSaving"
            @close="handleCloseForm"
            @submit="handleSubmitForm"
        />
    </section>
</template>

<script>
    import { mapActions } from 'vuex'
    import RenderSideslider from './render-sideslider.vue'

    export default {
        components: {
            RenderSideslider
        },
        props: {
            dataBaseInfo: Object
        },
        data () {
            return {
                dataBaseName: '',
                dataBaseList: [],
                isLoading: false,
                formStatus: {
                    showAdd: false,
                    editForm: {
                        host: '',
                        port: '',
                        username: '',
                        password: '',
                        dbName: ''
                    },
                    isSaving: false
                }
            }
        },
        computed: {
            emptyType () {
                if (this.dataBaseName) {
                    return 'search'
                }
                return 'noData'
            },
            displayDataBaseList () {
                return this.dataBaseList.filter(dataBase => dataBase.dbName.toLowerCase().includes(this.dataBaseName.toLowerCase()))
            },
            projectId () {
                return this.$route.params.projectId
            }
        },
        created () {
            this.getThirdPartDB()
        },
        methods: {
            ...mapActions('thirdPartDB', [
                'addDatabase',
                'getDatabase'
            ]),
          
            handlerClearSearch () {
                this.dataBaseName = ''
            },

            handleShowAdd () {
                this.formStatus.showAdd = true
            },

            async handleSubmitForm (editForm) {
                try {
                    this.formStatus.isSaving = true
                    const postData = {
                        ...editForm,
                        projectId: this.projectId,
                        password: btoa(editForm.password)
                    }
                    await this.addDatabase(postData)
                    this.getThirdPartDB()
                    this.handleCloseForm()
                } catch (error) {
                    console.error(error)
                } finally {
                    this.formStatus.isSaving = false
                }
            },

            handleCloseForm () {
                window.leaveConfirm = false
                this.formStatus.showAdd = false
            },

            getThirdPartDB () {
                this.isLoading = true
                this.getDatabase({
                    projectId: this.projectId
                }).then((res) => {
                    this.dataBaseList = res
                    if (!this.dataBaseInfo.dbName && res.length) {
                        this.setActiveDataBase(res[0])
                    }
                }).finally(() => {
                    this.isLoading = false
                })
            },

            setActiveDataBase (dataBase) {
                this.$emit('choose-data-base', dataBase)
            }
        }
    }
</script>

<style lang="postcss" scoped>
  @import "@/css/mixins/ellipsis";

  .data-base-tools {
    padding: 15px;
    display: flex;
    .filter-database-name {
      margin-right: 8px;
    }
  }
  .database-item-list {
    margin-top: 9px;
    .database-item {
        padding: 0 15px;
        height: 40px;
        line-height: 19px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        cursor: pointer;
        .database-item-name {
            @mixin ellipsis 330px;
            line-height: 19px;
            flex: 1;
            .bk-drag-data-source-manage {
                margin-right: 4px;
                font-size: 16px;
            }
        }
        &.active {
            background: #e1ecff;
            color: #3a84ff;
            .table-item-num {
                background: #a3c5fd;
                color: #ffffff;
            }
        }
    }
  }
</style>
