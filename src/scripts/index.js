// Elements
const tzs = [document.querySelector('#tz1'), document.querySelector('#tz2')];
const all_timezones = document.querySelector('#all-timezones');
const start_date = document.querySelector('#start_date');
const end_date = document.querySelector('#end_date');
const table = document.querySelector('#result');

// Constants
const MIN_DATE = '1970-01-01';
const MAX_DATE = '2500-01-01';

function add_option(value) {
    const option = document.createElement('option');
    option.value = value;
    all_timezones.appendChild(option);
}

/**
*   Add all timezones to the datalist
*/
function add_timezones() {
    for (const city in cities) {
        // To account for multiple cities with same name
        const c = cities[city];

        const countries = c.map(x => x.iso2);
        const duplicate_cities = c.length > 1;
        const duplicate_countries = countries.length != new Set(countries).size;

        for (const c2 of c) {
            add_option(
                // City name + potentially province and iso2 (country code)
                c2.city + 
                (duplicate_cities ? 
                    duplicate_countries ?
                        `, ${c2.province}, ${c2.iso2}` : 
                    `, ${c2.iso2}` :
                '')
            );
        }
    }
}

function set_default_values() {
    start_date.value = moment().format('YYYY-MM-DD');
    end_date.value = moment().add(1, 'year').format('YYYY-MM-DD');
    tzs[0].value = timezone_city[moment.tz.guess()];
    tzs[1].value = timezone_city[moment.tz.guess()];
}

function add_event_listeners() {
    tzs[0].onkeyup = update_time_difference;
    tzs[1].onkeyup = update_time_difference;    
    start_date.onkeyup = update_time_difference;
    end_date.onkeyup = update_time_difference;
}

function get_city_details(city, country) {
    const p = cities[city.toLowerCase()];
    
    // No possibilities
    if (!p) return;

    // Only 1 possibility
    if (p.length == 1) return p[0];

    // Multiple possibilities
    return p.find(x => x.iso2 == country);
}

/**
*   Update the time based on the selected timezones
*/
function update_time_difference() {
    const [ city1, country1 ] = tzs[0].value.split(', ');
    const [ city2, country2 ] = tzs[1].value.split(', ');

    const tz1 = get_city_details(city1, country1)?.timezone;
    const tz2 = get_city_details(city2, country2)?.timezone;

    if (!tz1 || !tz2) return;

    const differences = {};

    let current = start_date.value;
    const end = end_date.value;

    // Checking that we are not out of range
    if (current > MAX_DATE) current = MAX_DATE;
    if (end > MAX_DATE) end = MAX_DATE;
    if (current < MIN_DATE) current = MIN_DATE;
    if (end < MIN_DATE) current = MIN_DATE;

    let previous_difference;
    let current_difference = moment.tz(current, tz1).diff(moment.tz(current, tz2), 'hours');

    while (current <= end) {
        if (current_difference != previous_difference) {
            differences[current] = current_difference;
            previous_difference = current_difference;
        }

        // Incrementing date
        current = moment(current).add(1, 'days').format('YYYY-MM-DD');
        current_difference = moment.tz(current, tz1).diff(moment.tz(current, tz2), 'hours');
    }

    if (!differences[end]) differences[end] = null;

    clear_table(table);
    add_rows(table, differences, end);
}

function clear_table(table) {
    table.innerHTML = '';

    // // Adding header
    // const header = table.createTHead();
    // const row = header.insertRow(0);
    // const cell = row.insertCell(0);
    // cell.innerHTML = 'Date';
}

function add_rows(table, differences, end) {
    // return Object.keys(differences).sort().map(x => {
    //     return `<tr><p>${moment(x).format('ddd d MMM YYYY')}: ${differences[x]}</p></tr>`
    // }).join('');

    const tz = tzs[1].value;
    for (const date in differences) {
        // const row = table.insertRow(-1);
        // const date_cell = row.insertCell(0);
        // date_cell.innerHTML = moment(date).format('ddd MMM d Y');
        // const diff_cell = row.insertCell(1);
        // diff_cell.innerHTML = `${tz} is ${Math.abs(differences[date])} hours ${differences[date] < 0 ? 'behind' : 'ahead of'} ${tzs[0].value}`;
        table.innerHTML += 
            `<p class="date">${moment(date).format('ddd MMM D Y')}</p>` + 
            ((date == end) ? '' : `<p>|</p><p class="diff">${tz} is <strong>${Math.abs(differences[date])} hours</strong> ${differences[date] < 0 ? 'behind' : 'ahead of'} ${tzs[0].value}</p>` + 
            `<p>|</p>` )
    }
}

// Initialising page
add_timezones();
set_default_values();
add_event_listeners();

update_time_difference();