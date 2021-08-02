import { readable, Subscriber } from "svelte/store";

export const fetchStore = <T>(url: string, initialValue?: T) => readable(initialValue, (set) => {
    makeRequest(url, set);
    return () => {};
});

const makeRequest = async <T>(url: string, set: Subscriber<T>) => {
    // TODO: handle exceptions
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        set(data);
    }
};
