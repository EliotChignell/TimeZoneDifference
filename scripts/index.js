// Elements
const tzs = [document.querySelector('#tz1'), document.querySelector('#tz2')];
const all_timezones = document.querySelector('#all-timezones');
const start_date = document.querySelector('#start_date');
const end_date = document.querySelector('#end_date');
const table = document.querySelector('#result');

// cities and timezone_city variables are imported

// Constants
const MIN_DATE = '1970-01-01';
const MAX_DATE = '2500-01-01';

/**
*   Add all cities to the datalist
*/
function add_cities() {
    for (const city in cities) {
        // To account for multiple cities with same name
        const c = cities[city];

        const countries = c.map(x => x.iso2);
        const duplicate_cities = c.length > 1;
        const duplicate_countries = countries.length != new Set(countries).size;

        for (const c2 of c) {
            const option = document.createElement('option');
            option.value = 
                // City name + potentially province and iso2 (country code)
                c2.city + 
                (duplicate_cities ? 
                    duplicate_countries ?
                        `, ${c2.province}, ${c2.iso2}` : 
                    `, ${c2.iso2}` :
                '');
            all_timezones.appendChild(option);
        }
    }
}

/**
 * Sets default values for the field
 */
function set_default_values() {
    // Sets dates to today and 1 year from today
    start_date.value = moment().format('YYYY-MM-DD');
    end_date.value = moment().add(1, 'year').format('YYYY-MM-DD');

    // Setting the cities to where we think the user is
    tzs[0].value = timezone_city[moment.tz.guess()];
    tzs[1].value = timezone_city[moment.tz.guess()];
}

/**
 * Activates event listeners for each field
 */
function add_event_listeners() {
    for (const field of [...tzs, start_date, end_date]) {
        field.onkeyup = update_time_difference;
    }
}

function get_city_details(details) {
    const city = details[0];
    const country = details.length > 1 ? details.at(-1) : null;
    const province = details.length > 2 ? details[1] : null;

    const p = cities[city.toLowerCase()];
    
    // No possibilities
    if (!p) return;

    // Only 1 possibility
    if (p.length == 1) return p[0];

    // Multiple possibilities
    return p.find(x => x.iso2 == country && (!province || province == x.province));
}

/**
*   Update the time differences based on the entered cities
*/
function update_time_difference() {
    const city1 = get_city_details(tzs[0].value.split(', '));
    const city2 = get_city_details(tzs[1].value.split(', '));

    const tz1 = city1?.timezone;
    const tz2 = city2?.timezone;

    // If no timezone found for either
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

    // Adding a thing at the end as well
    if (!differences[end]) differences[end] = null;

    clear_table();

    const changes = add_rows(table, differences, end);

    return {
        differences,
        changes,
        city1,
        city2
    };
}

function clear_table() {
    table.innerHTML = '';
}

function add_rows(table, differences, end) {
    const tz = tzs[1].value;
    const changes = [];
    for (const date in differences) {
        const change_text = `${tz} is ${Math.abs(differences[date])} hours ${differences[date] < 0 ? 'behind' : 'ahead of'} ${tzs[0].value}`;
        changes.push(change_text);

        table.innerHTML += 
            `<p class="date">${moment(date).format('ddd MMM D Y')}</p>` + 
            ((date == end) ? '' : `<p>|</p><p class="diff">${change_text}</p>` + 
            `<p>|</p>` )
    }

    return changes;
}

function export_to_calendar() {
    const { differences, changes, city1, city2 } = update_time_difference();
    const calendar = ics();

    let index = 0;
    for (const date in differences) {
        if (differences[date]) {
            calendar.addEvent(
                changes[index].replace('is', 'is now'), 
                '', // description
                '', // location
                moment(date),
                moment(date).add(1, 'days')
            );
        }

        index++;
    }

    calendar.download(`${city1.city}-${city2.city} Timezone differences`);
}

// Initialising page
add_cities();
set_default_values();
add_event_listeners();

// Initial call
update_time_difference();