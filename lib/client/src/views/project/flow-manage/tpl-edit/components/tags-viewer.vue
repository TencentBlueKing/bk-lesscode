<template>
    <div class="tags-viewer" ref="tagsViewerRef">
        <div class="tag-items-wrapper" ref="tagListRef">
            <bk-tag v-for="tag in visibleTags" :key="tag" v-bk-overflow-tips @click="handleClick(tag)">
                {{ tag }}
            </bk-tag>
            <bk-popover v-if="hiddenTags.length > 0" theme="light" :max-width="500">
                <bk-tag ref="moreTagRef" class="more-tag"> +{{ hiddenTags.length }} </bk-tag>
                <template #content>
                    <div class="more-tags-content">
                        <bk-tag v-for="tag in hiddenTags" :key="tag" @click="handleClick(tag)">{{ tag }}</bk-tag>
                    </div>
                </template>
            </bk-popover>
        </div>
    </div>
</template>
<script>
    import { defineComponent, ref, watch, onMounted, nextTick } from 'vue'

    export default defineComponent({
        name: 'TagsViewer',
        props: {
            tags: Array,
            maxWidth: Number
        },
        setup(props, { emit }) {
            const visibleTags = ref([])
            const hiddenTags = ref(props.tags.slice())
            const tagsViewerRef = ref(null)
            const tagListRef = ref(null)
            const moreTagRef = ref(null)

            watch(() => props.tags, async() => {
                visibleTags.value = []
                hiddenTags.value = props.tags.slice()
                await nextTick()
                calcLayout()
            })

            onMounted(() => {
                calcLayout()
            })

            const calcLayout = async() => {
                const containerWidth = typeof props.maxWidth === 'number' ? props.maxWidth : (tagsViewerRef.value?.offsetWidth || 0)
                if (containerWidth === 0) return


                for(let i = 0; i < props.tags.length; i++) {
                    if (tagListRef.value?.offsetWidth < containerWidth) {
                        if (hiddenTags.value.length > 0) {
                            const tag = hiddenTags.value.shift()
                            visibleTags.value.push(tag)
                        }
                        await nextTick();
                        if (tagListRef.value?.offsetWidth > containerWidth) {
                            // 至少显示1个tag标签
                            if (i > 0) {
                                const lastTag = visibleTags.value.pop()
                                hiddenTags.value.unshift(lastTag)
                            } else {
                                tagListRef.value.style.width = `${containerWidth}px`
                            }
                            break;
                        }
                    } else {
                        tagListRef.value.style.width = `${containerWidth}px`
                        break;
                    }
                }
            };

            const handleClick = (tag) => {
                emit('tagClick', tag)
            }

            return {
                visibleTags,
                hiddenTags,
                tagsViewerRef,
                tagListRef,
                moreTagRef,
                handleClick
            }
        },
    })
</script>
<style lang="postcss" scoped>
    .tags-viewer {
        width: 100%;
        overflow: hidden;
    }
    .tag-items-wrapper {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 100%;
        overflow: hidden;
        & > .bk-tooltip {
            flex-shrink: 0;
        }
        & > .bk-tag {
            overflow: hidden;
        }
    }
    .bk-tag {
        flex: 0 1 auto;
        margin-left: 0;
        min-width: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;

    }
    .more-tags-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .bk-tag {
            flex-shrink: 0;
        }
    }
</style>
