import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type MenuActions from './MenuActions';

export const menuActions = new Subject<MenuActions | null>();

export const createMenuActionsStream = <T extends MenuActions>(
	filterAction: T
): Observable<boolean> => menuActions.asObservable().pipe(map((action) => action === filterAction));
