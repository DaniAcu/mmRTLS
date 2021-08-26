import type { IIndoorPosition } from 'src/interfaces/position.interface';

export const isSamePosition: (pos1: IIndoorPosition, pos2: IIndoorPosition) => boolean = (
	pos1,
	pos2
) => pos1.x === pos2.x && pos1.y === pos2.y;
