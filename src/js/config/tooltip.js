
const Tooltip = [
    '$tooltipProvider',

    $tooltipProvider => $tooltipProvider.setTriggers({
        mouseenter: 'mouseleave',
        click: 'click',
        focus: 'blur',
        never: 'mouseleave',
        show: 'hide'
    })
]

export default Tooltip
