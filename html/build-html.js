
import e from 'express';
import fs from 'fs'

const textWithFont = (text, height, marginBetweenChars)=>{
    const template = '<img src="https://drip-stats-bot.ngrok.io/{value}.png" style="height:{height}px; margin-left: {marginBetweenChars}px"/>'
    var html = '';
    for (var i = 0; i < text.length; i++) {
        var letter = text.charAt(i)

        if(letter === '_'){
            html += "&nbsp;"
        }else{
            html += template.replace('{height}', height).replace('{marginBetweenChars}', i==0?'0':(marginBetweenChars?marginBetweenChars:'-20')).replace('{value}', letter)
        }
    }

    return '<div>' +html+ '</div>';
}
const space = ()=>{
    return '&nbsp;';
}

export default (stats, chatId, __dirname) => {
    const ranges = stats.ranges.reverse();
    const results = stats.results.reverse();
    const total = stats.sum

    var template = fs.readFileSync(__dirname + '/html/template.html', {encoding:'utf8', flag:'r'})

    for (let i = 0; i < ranges.length; i++) {
        var range = ranges[i]
        var result = results[i]

        template = template.replace(`{rank${i+1}1}`, textWithFont(`deposits__-__${range}__drip`, '30', '-10'))
        template = template.replace(`{rank${i+1}2}`, textWithFont(`drippers______${result}`, '30', '-10'))
    }

    template = template.replace(`{total}`, textWithFont(`total_drippers__${total}`, '30', '-10'))

    return template
}