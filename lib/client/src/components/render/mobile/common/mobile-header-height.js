import { ref, computed } from '@vue/composition-api'
import moment from 'moment'
export default function () {
    const height = ref(30)
    const time = computed(() => {
        return moment().format('hh:mm')
    })
  
    return {
        height,
        time
    }
}
