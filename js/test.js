// 将字符串转换为驼峰格式
// css 中经常有类似 background-image 这种通过 - 连接的字符，通过 javascript 设置样式的时候需要将这种样式转换成 backgroundImage 驼峰格式，请完成此转换功能
// 1. 以 - 为分隔符，将第二个起的非空单词首字母转为大写
// 2. -webkit-border-image 转换后的结果为 webkitBorderImage
// 样例：
// 输入：’font-size‘
// 输出：’fontSize‘

const toUpper = (s) => {

    let sArr = s.split('-');
    let res = ''
    // console.log(sArr)
    // 找到第一个不是‘’的substr
    let start = 0;
    while(sArr[start] === '') {
        start++ ;
    }
    res += sArr[start];
    start ++ ;

    for(let i = start; i < sArr.length; i++) {

        let nextSubStr = sArr[i];
        if(nextSubStr === '') {
            continue ;
        }
        let firstChar =  nextSubStr[0].toUpperCase();
        let leftChar = nextSubStr.slice(1);
        res = res + firstChar + leftChar;
    }
    // console.log(s)
    console.log(res);
}

toUpper('-webkit--border-image')



