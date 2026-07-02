const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, 'pages/hotel/home-lumina/home-lumina.html');
const cssPath = path.join(__dirname, 'pages/hotel/home-lumina/home-lumina.css');
const jsPath = path.join(__dirname, 'pages/hotel/home-lumina/home-lumina.js');

let html = fs.readFileSync(htmlPath, 'utf8');

const styleRegex = /<style>([\s\S]*?)<\/style>/i;
const styleMatch = html.match(styleRegex);
if (styleMatch) {
    fs.appendFileSync(cssPath, '\n' + styleMatch[1]);
    html = html.replace(styleRegex, '<link href="home-lumina.css" rel="stylesheet" />');
}

const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let newHtml = html;
let matchedAny = false;

// We need to be careful with multiple script tags without src
let jsToAppend = '';
const matches = [];
while ((match = scriptRegex.exec(html)) !== null) {
    matches.push(match);
}

for (let i = 0; i < matches.length; i++) {
    jsToAppend += '\n' + matches[i][1];
    if (i === 0) {
        newHtml = newHtml.replace(matches[i][0], '<script src="home-lumina.js"></script>');
    } else {
        newHtml = newHtml.replace(matches[i][0], ''); // remove subsequent inline scripts
    }
}

if (matches.length > 0) {
    fs.appendFileSync(jsPath, jsToAppend);
}

fs.writeFileSync(htmlPath, newHtml);
console.log('Successfully extracted CSS and JS');
