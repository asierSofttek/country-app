import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, delay, map, Observable, of, pipe, tap, throwError } from 'rxjs';
import { RESTCountry } from '../interfaces/rest-countries.interface';
import { CountryMapper } from '../mappers/country.mapper';
import type { Country } from '../interfaces/country.interface';
import { Region } from '../interfaces/region.type';


const API_URL = 'https://restcountries.com/v3.1';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private http = inject(HttpClient);
  private queryCacheCapital = new Map<string, Country[]>();
  private queryCacheCountry = new Map<string, Country[]>();
  private queryCacheRegion = new Map<Region, Country[]>();


  searchByCapital(query: string): Observable<Country[]> {
    query = query.toLowerCase();

    if (this.queryCacheCapital.has(query)) {
      return of(this.queryCacheCapital.get(query) ?? []);
    }


    return this.http.get<RESTCountry[]>(`${API_URL}/capital/${query}`)
      .pipe(
        map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
        tap(countries => { this.queryCacheCapital.set(query, countries) }),
        catchError(error => {
          console.log('Error fetching', error);
          return throwError(() => new Error(`No se pudieron obtener países con esa búsqueda ${query}`))

        })
      )
  }

  searchByCountry(query: string): Observable<Country[]> {
    query = query.toLowerCase();
    if (this.queryCacheCountry.has(query)) {
      return of(this.queryCacheCountry.get(query) ?? []);
    }

    console.log(`Llegando al servidor por ${query}`);


    return this.http.get<RESTCountry[]>(`${API_URL}/name/${query}`)
      .pipe(
        map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
        tap(countries => { this.queryCacheCountry.set(query, countries) }),
        delay(2000),
        catchError(error => {
          console.log('Error fetching', error);
          return throwError(() => new Error(`No se pudo obtener el país ${query}`))

        })
      )
  }

  searchByCountryAlphaCode(code: string) {

    return this.http.get<RESTCountry[]>(`${API_URL}/alpha/${code}`)
      .pipe(
        map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
        map(countries => countries.at(0)),
        catchError(error => {
          console.log('Error fetching', error);
          return throwError(() => new Error(`No se pudo obtener el país con ese código ${code}`))

        })
      )
  }

  searchByRegion(region: Region) {

    if (this.queryCacheRegion.has(region)) {
      return of(this.queryCacheRegion.get(region) ?? []);
    }

    return this.http.get<RESTCountry[]>(`${API_URL}/region/${region}`)
      .pipe(
        map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
        tap(countries => { this.queryCacheRegion.set(region, countries) }),
        catchError(error => {
          console.log('Error fetching', error);
          return throwError(() => new Error(`No se pudo obtener la ${region}`))

        })
      )
  }

}
