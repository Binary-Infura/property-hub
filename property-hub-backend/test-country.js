const { getAllCitiesOfCountry, getStatesOfCountry } = require('@countrystatecity/countries');

async function test() {
  const states = await getStatesOfCountry('IN');
  console.log('States:', states.length);
  const cities = await getAllCitiesOfCountry('IN');
  console.log('Cities:', cities.length, cities[0]);
}

test();
