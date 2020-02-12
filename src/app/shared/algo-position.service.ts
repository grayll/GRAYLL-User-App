import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlgoPositionModel } from '../system/algo-position.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Index, QueryParameters } from 'algoliasearch';
import { AlgoliaService } from '../algolia.service';

@Injectable({
  providedIn: 'root'
})
export class AlgoPositionService {
  private algoPositions$: Observable<AlgoPositionModel[]>;
  algoPositionCollection: AngularFirestoreCollection<AlgoPositionModel>;
  get algoPositions(){
    return this.algoPositions$;
  }
  private index: Index;
  
  constructor(private afs: AngularFirestore, private algolia: AlgoliaService) {
    this.algoPositionCollection = afs.collection<AlgoPositionModel>('algoPositions');
    this.algoPositions$ = this.algoPositionCollection.valueChanges();
  }

  search(params:QueryParameters){
    this.index = this.algolia.initializeIndex('algoPositions');
    return this.index.search(params);
  }
  
  addAlgoPosition(item: AlgoPositionModel) {
    this.algoPositionCollection.add(item);
  }
}
