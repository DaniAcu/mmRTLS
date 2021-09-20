import { BehaviorSubject } from 'rxjs';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type MenuActions from './Actions';

export const menuActions = new BehaviorSubject<MenuActions | null>(null);

export const createMenuActionsStream = <T extends MenuActions>(
	filterAction: T | T[]
): Observable<boolean> =>
	menuActions
		.asObservable()
		.pipe(
			map((action) =>
				[...(filterAction instanceof Array ? filterAction : [filterAction])].some(
					(a) => a === action
				)
			)
		);
