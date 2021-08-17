import { timer, MonoTypeOperatorFunction } from "rxjs";
import { switchMapTo } from "rxjs/operators";

export function poll<T>(pollInterval: number): MonoTypeOperatorFunction<T> {
  return source$ => timer(0, pollInterval).pipe(switchMapTo(source$));
}