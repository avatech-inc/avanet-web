
interface PNG {
    decodePixels(): Uint8Array;
}

interface PNGStatic {
    new(data?: ArrayBuffer): PNG;
}

interface Window {
    PNG: PNGStatic;
}
