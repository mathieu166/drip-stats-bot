
import e from 'express';
import fs from 'fs'

const textWithFont = (text, height, marginBetweenChars) => {
    const template = '<img src="https://drip-stats-bot.ngrok.io/{value}.png" style="height:{height}px; margin-left: {marginBetweenChars}px"/>'
    var html = '';
    for (var i = 0; i < text.length; i++) {
        var letter = text.charAt(i)

        if (letter === '_') {
            html += "&nbsp;"
        } else {
            html += template.replace('{height}', height).replace('{marginBetweenChars}', i == 0 ? '0' : (marginBetweenChars ? marginBetweenChars : '-20')).replace('{value}', letter)
        }
    }

    return '<div>' + html + '</div>';
}
const space = () => {
    return '&nbsp;';
}

export default (chartid, __dirname) => {
    var template = fs.readFileSync(__dirname + '/html/chart.html', { encoding: 'utf8', flag: 'r' })
    template = template.replace(`{chartId}`, chartid)
    return template
}