const map = require('./all_data.json');
const fs = require('fs');

const a = {};

for (const c of map) {
    const n = c.city_ascii.toLowerCase().replace(',', '');
    if (!a[n]) a[n] = [];

    delete c.lat;
    delete c.lng;
    delete c.iso3;
    delete c.pop;
    delete c.city;

    c.city = c.city_ascii.replace(',', '');

    delete c.city_ascii;

    a[n].push(c);
}

fs.writeFileSync('scripts/cities.js', 'const cities = ' + JSON.stringify(a));