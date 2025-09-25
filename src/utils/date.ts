export const formatYYYYMMDDWithWeek = (date: Date = new Date()): string => {
    const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const w = weekMap[date.getDay()]
    return `${y}-${m}-${d} ${w}`
}

export const formatHHmmss = (date: Date = new Date()): string => {
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
}