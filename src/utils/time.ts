// 封装一个函数：获取一个结果：当前早上|上午|晚上
export const getTime = () => {
    // 通过内置的构造函数Date
    let hours = new Date().getHours()
    if (hours >= 6 && hours < 12) {
        return '上午'
    } else if (hours >= 12 && hours < 18) {
        return '下午'
    } else {
        return '晚上'
    }
}