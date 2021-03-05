export const invertColor = (hex) => {
    hex = hex.substring(1,7);
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    var lum = r * 0.299 + g * 0.587 + b * 0.114;
    return (lum > 186 ? "#000000" : "#ffffff");
}