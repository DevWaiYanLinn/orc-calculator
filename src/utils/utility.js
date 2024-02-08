
export const calculate = function (text) {
    if (!text) return ''
    try {
        text = text.replace(/\^/g, '**')
        text = text.replace(/√(\d+)/g, (match, number) => {
            return `Math.sqrt(${number})`;
        })
        const check = ['+', '-', '*', '/', '%'].includes(text.charAt(text.length - 1))
        if (check) {
            text = text.slice(0, -1)
        }
        const sum = new Function(`return ${text}`)
        return sum()
    } catch {
        return 'Error'
    }
}

