import type { Observable } from "rxjs";
import { filter, fromEvent, map } from "rxjs";

const ACCEPTED_FILE_TYPES = [
    'image/png',
    'image/jpeg'
] as const;

type AcceptedFileTypes = typeof ACCEPTED_FILE_TYPES[number];

const getFilesObservable = (input: HTMLInputElement) => fromEvent(input, 'change').pipe(
    map(() => input.files as FileList),
    filter(files => !!files),
    map(files => files[0]),
    filter(file => ACCEPTED_FILE_TYPES.includes(file.type as AcceptedFileTypes))
)

export const getBase64: (file: File) => Observable<string> = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    return fromEvent(fileReader, 'load').pipe(
        map(() => fileReader.result as string)
    );
};

export class FileUploader {

    public readonly fileUpload: Observable<File>;

    private readonly input = document.createElement('input');

    constructor() {
        this.input.type = 'file';
        this.input.accept = ACCEPTED_FILE_TYPES.join();
        this.fileUpload = getFilesObservable(this.input);
    }

    public openUploadWindow(): void {
        this.input.click();
    }
}