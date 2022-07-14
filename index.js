const fs = require('fs');
const http = require('http');
const url = require('url');

// Read JSON file
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

// Read HTML file
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8'); //prettier-ignore
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`,'utf-8'); //prettier-ignore
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8'); //prettier-ignore

// Replace template with data function
const replaceTemp = function (temp, dataProducts) {
    const tempArr = [
        '{%ID%}',
        '{%PRODUCT_NAME%}',
        '{%IMAGE%}',
        '{%FROM%}',
        '{%NUTRIENTS%}',
        '{%QUANTITY%}',
        '{%PRICE%}',
        '{%NOT_ORGANIC%}',
        '{%DESCRIPTION%}',
    ];

    const productEntries = Object.entries(dataProducts);

    let output = tempArr.reduce((acu, item, i) => {
        if (productEntries[i][0] === 'organic') return acu;

        return acu.replaceAll(item, productEntries[i][1]);
    }, temp);
    if (!dataProducts.organic)
        output = output.replaceAll('{%NOT_ORGANIC%}', 'not-organic');
    return output;
};

// Create a server
const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });

        const overview = dataObj
            .map((product) => replaceTemp(tempCard, product))
            .join('');

        const output = tempOverview.replace('{%TEMPLATE_CARD%}', overview);

        return res.end(output, 'utf-8');
    }

    if (pathname === '/product') {
        const product = dataObj[query.id];
        const output = replaceTemp(tempProduct, product);

        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        return res.end(output);
    }

    if (pathname === '/api') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });

        res.end(data);
    }

    res.writeHead(404, {
        'Content-Type': 'text/html',
    });

    res.end('Page not found');
});

server.listen(8000, () => {
    console.log(`Server running on port http://localhost:8000`);
});
