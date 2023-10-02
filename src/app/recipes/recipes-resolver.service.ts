import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { map, of, switchMap, take } from 'rxjs';

import { Recipe } from './recipe.model';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from './store/recipe.actions';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<{ recipes: Recipe[] }> {
  constructor(
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('recipes').pipe(
      take(1),
      map((recipesState) => recipesState.recipes),
      switchMap((recipes) => {
        if (recipes.length === 0) {
          this.store.dispatch(RecipesActions.fetchRecipes());
          return this.actions$.pipe(ofType(RecipesActions.setRecipes), take(1));
        } else {
          return of({ recipes });
        }
      })
    );
  }
}

// Função de Resolve
export function recipesResolver(): ResolveFn<{ recipes: Recipe[] }> {
  return () => {
    const store: Store<fromApp.AppState> = inject(Store);
    const actions$: Actions = inject(Actions);
    return store.select('recipes').pipe(
      take(1),
      map((recipesState) => recipesState.recipes),
      switchMap((recipes) => {
        if (recipes.length === 0) {
          store.dispatch(RecipesActions.fetchRecipes());
          return actions$.pipe(ofType(RecipesActions.setRecipes), take(1));
        } else {
          return of({ recipes });
        }
      })
    );
  }
}