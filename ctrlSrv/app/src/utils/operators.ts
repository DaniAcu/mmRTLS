import { timer } from "rxjs";
import type { MonoTypeOperatorFunction } from "rxjs"
import { switchMapTo } from "rxjs/operators";

export function poll<T>(pollInterval: number): MonoTypeOperatorFunction<T> {
  return source$ => timer(0, pollInterval).pipe(switchMapTo(source$));
}