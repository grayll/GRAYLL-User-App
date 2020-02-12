import { Injectable } from '@angular/core';
import * as algoliasearch from 'algoliasearch';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlgoliaService {
  private client: algoliasearch.Client;
  constructor() { }

  init(){
    this.client = algoliasearch(environment.algolia.app_id, environment.algolia.search_key);
  }

  initializeIndex(index: string): algoliasearch.Index{
    return this.client.initIndex(index);
  }


}
