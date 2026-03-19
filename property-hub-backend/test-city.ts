import { City, State } from 'country-state-city';
const states = State.getStatesOfCountry('IN');
console.log(states[0]?.name);
const cities = City.getCitiesOfCountry('IN');
console.log(cities?.length);
console.log(cities?.[0]);
