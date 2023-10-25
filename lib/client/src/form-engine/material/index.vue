<template>
    <section class="bkform-engine-material">
        <div class="material-list-warpper">
            <groupItem
                v-for="group in materialList"
                :key="group.name"
                :name="group.name"
                :list="group.children" />
        </div>
    </section>
</template>
<script>
    import groupItem from './group-item.vue'

    export default {
        name: 'bkformEngineMaterial',
        components: {
            groupItem
        },
        props: {
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                materialList: this.groupMaterials(this.list)
            }
        },
        watch: {
            list (val) {
                this.materialList = this.groupMaterials(val)
            }
        },
        methods: {
            groupMaterials (list) {
                const groups = []
                list.forEach(item => {
                    const index = groups.findIndex(g => g.name === item.group)
                    if (index > -1) {
                        groups[index].children.push(item)
                    } else {
                        groups.push({
                            name: item.group,
                            children: [item]
                        })
                    }
                })
                return groups
            }
        }
    }
</script>
