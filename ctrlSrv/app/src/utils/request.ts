import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ResponseType<T> = T | T[] | boolean;
type ObservableResponse<T> = Observable<ResponseType<T>>;

type Config<Default, Item> = {
	endpoint: string;
	getDefault: () => Observable<Default>;
	getId: (item?: Item) => string | null;
};

function createRequest<T>(config: Config<T[], T>, method: 'GET'): Observable<T[]>;
function createRequest<T>(config: Config<T, T>, method: 'POST' | 'PATCH', item: T): Observable<T>;
function createRequest<T>(config: Config<boolean, T>, method: 'PUT', item: T): Observable<boolean>;
function createRequest<T>(
	config: Config<boolean, T>,
	method: 'DELETE',
	item: T
): Observable<boolean>;
function createRequest<T>(
	config: Config<ResponseType<T>, T>,
	method: Method,
	item?: T
): ObservableResponse<T> {
	const { getDefault, getId, endpoint } = config;
	const id = getId(item);
	const url = id ? `${endpoint}/${id}` : endpoint;

	const reqConfig = {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		method,
		body: item && JSON.stringify(item)
	};

	const request = new Request(url, reqConfig);

	const logBeaconError = (message: string) => {
		// eslint-disable-next-line no-console
		console.error(message);
		return getDefault() as ObservableResponse<T>;
	};

	switch (method) {
		case 'GET':
		case 'POST':
			return fromFetch(request).pipe(
				switchMap((response) => {
					if (response.ok) return response.json() as Promise<T | T[]>;
					throw new Error(`Error fetching to ${method} ${url}.`);
				}),
				catchError(logBeaconError)
			);
		case 'PUT':
		case 'PATCH':
		case 'DELETE':
			return fromFetch(request).pipe(
				switchMap((response) => {
					if (response) return of(true);
					throw new Error(`Error fetching to ${method} ${url}.`);
				}),
				catchError(logBeaconError)
			);
	}
}

export default createRequest;
