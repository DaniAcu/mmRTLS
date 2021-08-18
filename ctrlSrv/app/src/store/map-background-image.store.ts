import { BehaviorSubject } from "rxjs";
import type { IIndoorPosition } from "src/interfaces/position.interface";

export const mapBackgroundImage = new BehaviorSubject<string | null>('./static/indoor-map.png');
export const mapMaxPosition = new BehaviorSubject<IIndoorPosition | null>(null);