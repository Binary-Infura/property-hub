import { Injectable, Logger } from '@nestjs/common';
import {
  getCountries,
  getStatesOfCountry,
  getCitiesOfState
} from '@countrystatecity/countries';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  async getContinents() {
    try {
      const countries = await getCountries();
      const continents = [...new Set(countries.map(c => c.region).filter(Boolean))];
      return continents.sort();
    } catch (error) {
      this.logger.error(`Failed to get continents: ${error.message}`);
      return [];
    }
  }

  async getCountries(continent?: string) {
    try {
      let countries = await getCountries();

      if (continent) {
        countries = countries.filter(c => c.region === continent);
      }

      return countries.sort((a, b) => a.name.localeCompare(b.name)).map(c => ({
        id: c.iso2, // Using ISO2 as ID since we removed DB
        code: c.iso2,
        name: c.name,
        phoneCode: c.phonecode,
        currency: c.currency,
        continent: c.region,
        emoji: c.emoji
      }));
    } catch (error) {
      this.logger.error(`Failed to get countries: ${error.message}`);
      return [];
    }
  }

  async getStates(countryCode: string) {
    try {
      const states = await getStatesOfCountry(countryCode);
      return states.sort((a, b) => a.name.localeCompare(b.name)).map(s => ({
        id: s.iso2, // Use ISO2 as ID
        name: s.name,
        code: s.iso2
      }));
    } catch (error) {
      this.logger.error(`Failed to get states for ${countryCode}: ${error.message}`);
      return [];
    }
  }

  async getCities(countryCode: string, stateCode: string) {
    try {
      const cities = await getCitiesOfState(countryCode, stateCode);
      return cities.sort((a, b) => a.name.localeCompare(b.name)).map(c => ({
        id: c.name, // Cities don't have ISO codes, using name
        name: c.name
      }));
    } catch (error) {
      this.logger.error(`Failed to get cities for ${countryCode}-${stateCode}: ${error.message}`);
      return [];
    }
  }

}
