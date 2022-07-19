<template>
    <section class="ticket-list-wrapper">
        <div class="filter-area">
            <bk-form form-type="vertical" class="filter-form">
                <bk-form-item label="创建人">
                    <bk-input v-model="filterData.creator" placeholder="请输入创建人"></bk-input>
                </bk-form-item>
                <bk-form-item label="创建时间">
                    <bk-date-picker
                        v-model="filterData.create_at"
                        placeholder="请选择创建时间"
                        type="datetimerange"
                        size="small">
                    </bk-date-picker>
                </bk-form-item>
                <bk-form-item label="单号">
                    <bk-input v-model="filterData.sns" placeholder="请输入单号"></bk-input>
                </bk-form-item>
                <bk-form-item label="状态">
                    <bk-select v-model="filterData.status" placeholder="请选择状态">
                        <bk-option v-for="item in ticketStatus" :key="item.key" :id="item.key" :name="item.name"></bk-option>
                    </bk-select>
                </bk-form-item>
            </bk-form>
            <div class="search-btns-wrapper">
                <bk-button style="margin-right: 4px;" theme="primary" @click="handleSearch">查询</bk-button>
                <bk-button @click="handleReset">重置</bk-button>
            </div>
        </div>
        <bk-table
            v-bkloading="{ isLoading: ticketListLoading }"
            :data="ticketList"
            :outer-border="!ticketList.length > 0"
            :pagination="pagination"
            :header-cell-style="{ background: '#f0f1f5' }"
            @page-change="handlePageChange"
            @page-limit-change="handlePageLimitChange">
            <bk-table-column label="单号" property="sn"></bk-table-column>
            <bk-table-column label="创建人" property="creator"></bk-table-column>
            <bk-table-column label="创建时间" property="create_at"></bk-table-column>
            <!-- <bk-table-column label="当前节点">
                <template slot-scope="{ row }">
                    <template v-if="row.current_steps.length > 0">
                        <span v-for="step in row.current_steps" :key="step.id">{{ step.name }}</span>
                    </template>
                    <span v-else>--</span>
                </template>
            </bk-table-column> -->
            <bk-table-column label="状态" property="status_name">
                <template slot-scope="{ row }">
                    <span :style="{ padding: '4px 10px', borderRadius: '2px', color: row.color, backgroundColor: row.backgroundColor }">
                        {{ row.status_name }}
                    </span>
                </template>
            </bk-table-column>
            <bk-table-column label="操作">
                <template slot-scope="{ row }">
                    <bk-button
                        style="padding: 0;"
                        theme="primary"
                        size="small"
                        :text="true"
                        @click="goToTicketPage(row)">
                        详情
                    </bk-button>
                </template>
            </bk-table-column>
        </bk-table>
    </section>
</template>
<script>
    import { TICKET_STATUS } from 'shared/no-code'
    import dayjs from 'dayjs'

    export default {
        name: 'TicketList',
        props: {
            serviceId: Number,
            viewType: String
        },
        data () {
            return {
                ticketStatus: TICKET_STATUS,
                filterData: {
                    creator: '',
                    create_at: [],
                    sns: '',
                    status: ''
                },
                ticketList: [],
                ticketListLoading: false,
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10
                }
            }
        },
        created () {
            this.getTicketList()
        },
        methods: {
            async getTicketList () {
                this.ticketListLoading = true
                const { current, limit } = this.pagination
                const params = {
                    page: current,
                    page_size: limit,
                    service_id__in: [this.serviceId]
                }
                Object.keys(this.filterData).forEach(key => {
                    const val = this.filterData[key]

                    if (key === 'create_at' && val.join('') !== '') {
                        params.create_at__gte = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
                        params.create_at__lte = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
                    }
                    if (['creator', 'sns', 'status'].includes(key) && val) {
                        params[key] = val
                    }
                })
                const res = await this.$http.post('/nocode/v2/itsm/get_tickets/', params)
                this.ticketList = res.data.items.map(ticket => {
                    const statusConfig = TICKET_STATUS.find(item => ticket.current_status === item.key)
                    ticket.status_name = statusConfig?.name || ticket.current_status
                    ticket.color = statusConfig?.color || '#63656e'
                    ticket.backgroundColor = statusConfig?.backgroundColor || 'transparent'
                    return ticket
                })
                this.pagination.count = res.data.count
                this.ticketListLoading = false
            },
            handleSearch () {
                this.pagination.current = 1
                this.getTicketList()
            },
            handleReset () {
                this.filterData = {
                    creator: '',
                    create_at: [],
                    sns: '',
                    status: ''
                }
                this.pagination.current = 1
                this.getTicketList()
            },
            handlePageChange (val) {
                this.pagination.current = val
                this.getTicketList()
            },
            handlePageLimitChange (val) {
                this.pagination.current = 1
                this.pagination.limit = val
                this.getTicketList()
            },
            goToTicketPage (ticket) {
                window.open(`${BK_ITSM_URL}/#/ticket/detail?id=${ticket}&project_id=lesscode`, '__blank')
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .filter-area {
        margin: 12px 0 32px;
        padding: 16px 8px;
        background: #fafbfd;
        border-radius: 2px;
        .filter-form {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .bk-form-item {
                flex: 1;
                margin: 0 8px;
            }
            >>> .bk-form-control {
                width: 100%;
            }
            .bk-date-picker {
                width: 100%;
            }
            .bk-select {
                background: #ffffff;
            }
        }
        .search-btns-wrapper {
            margin-top: 16px;
            padding: 0 8px;
        }
    }
</style>
