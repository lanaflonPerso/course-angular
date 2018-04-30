/*
 * Copyright (c) 2015-2018 IPT-Intellectual Products & Technologies (IPT).
 * All rights reserved.
 * 
 * This software provided by IPT-Intellectual Products & Technologies (IPT) is for 
 * non-commercial illustartive and evaluation purposes only. 
 * It is NOT SUITABLE FOR PRODUCTION purposes because it is not finished,
 * and contains security flаws and weaknesses (like sending the passwords and 
 * emails of users to the browser client, wich YOU SHOULD NEVER DO with real user
 * data). You should NEVER USE THIS SOFTWARE with real user data.
 * 
 * This file is licensed under terms of GNU GENERAL PUBLIC LICENSE Version 3
 * (GPL v3). The full text of GPL v3 license is providded in file named LICENSE,
 * residing in the root folder of this repository.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * IPT BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Injectable, Type } from '@angular/core';
import { LoggerService } from './logger.service';
import { Product } from '../products/product.model';
import { Identifiable, CollectionResponse, IndividualResponse, KeyType } from '../shared/common-types';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// tslint:disable-next-line:import-blacklist
// import 'rxjs/Rx';
// import 'rxjs/add/operator/flatMap';
// import 'rxjs/add/operator/do';
import { catchError, map, tap, retry, delay, take, retryWhen, concat, switchMap } from 'rxjs/operators';
import { COLLECTION_TYPES } from './collection-types';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';
import { Observable } from 'rxjs/Observable';
import { BackendService } from './backend.service';


const API_URL = 'http://localhost:4200/api/';

@Injectable()
export class BackendObservableService implements BackendService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

  /** GET: find all item */
  findAll<T extends Identifiable> (type: Type<T>): Observable<T[]> {
    return this.getCollectionName(type).pipe(
      switchMap(collection =>
        this.http.get<CollectionResponse<T>>(API_URL + collection)
        .pipe(
          map(productsResponse => productsResponse.data),
          tap(products => this.logger.log(products)),
          catchError(this.handleError),
          retryWhen(errors => errors.pipe(delay(1000), take(5),
            concat(new ErrorObservable('There was a problem with backend service. Try again later.')))),
        )
      )
    );
  }

  /** GET: find an item by id*/
  find <T extends Identifiable> (type: Type<T>, id: KeyType): Observable<T> {
    return this.getCollectionName(type).pipe(
      switchMap(collection =>
        this.http.get<IndividualResponse<T>>(`${API_URL}${collection}/${id}`)
        .pipe(
          map(productsResponse => productsResponse.data),
          catchError(this.handleError)
        )
      )
    );
  }



  /** POST: add a new item */
  add <T extends Identifiable> (type: Type<T>, item: T): Observable<T> {
    return this.getCollectionName(type).pipe(
      switchMap(collection =>
        this.http.post<IndividualResponse<T>>(API_URL + collection, item)
        .pipe(
          map(productsResponse => productsResponse.data),
          catchError(this.handleError)
        )
      )
    );
  }

  /** PUT: update an item */
  update <T extends Identifiable> (type: Type<T>, item: T): Observable<T> {
    return this.getCollectionName(type).pipe(
      switchMap(collection =>
        this.http.put<IndividualResponse<T>>(`${API_URL}${collection}/${item.id}`, item)
        .pipe(
          map(productsResponse => productsResponse.data),
          catchError(this.handleError)
        )
      )
    );
  }

  /** DELETE: remove an item */
  remove <T extends Identifiable> (type: Type<T>, id: KeyType): Observable<T> {
    return this.getCollectionName(type).pipe(
      switchMap(collection =>
        this.http.delete<IndividualResponse<T>>(`${API_URL}${collection}/${id}`)
        .pipe(
          map(productsResponse => productsResponse.data),
          catchError(this.handleError)
        )
      )
    );
  }


  private getCollectionName<T extends Identifiable> (type: Type<T>): Observable<string> {
    if (COLLECTION_TYPES.indexOf(type) < 0) {
      return new ErrorObservable(`Cannot recognize entity type: ${type.name}`);
    }
    const collection = type.name.toLowerCase() + 's';
    this.logger.log(`BackendService called for ${collection}.`);
    return ArrayObservable.of(collection) ;
    // return new Observable(obs => { obs.next(collection); obs.complete();}) ;

  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('Client-side error:', error.error.message);
    } else {
      // Backend unsuccessful status code.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)},
        message was: ${JSON.stringify(error.message)}`);
    }
    // return ErrorObservable with a user-facing error message
    return new ErrorObservable('Error performing the operation. Correct data and try again.');
  }


}



