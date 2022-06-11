import {
    defineComponent,
    ref,
    watch
} from '@vue/composition-api'
import monaco from '@/components/monaco.vue'
import {
    parseEditScheme2JsonValue
} from 'shared/api'

export default defineComponent({
    components: {
        monaco
    },

    props: {
        editScheme: [Object, Array]
    },

    setup (props) {
        const jsonValue = ref('')

        watch(
            () => props.editScheme,
            () => {
                const json = parseEditScheme2JsonValue(props.editScheme)
                jsonValue.value = JSON.stringify(json, null, 4)
            },
            {
                immediate: true
            }
        )

        return {
            jsonValue
        }
    },

    render () {
        return <monaco
            read-only={true}
            value={this.jsonValue}
        />
    }
})
