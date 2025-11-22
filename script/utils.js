export default class Utils {
    static prune(arr) {
        let i = arr.length;
        while (i--) if (!arr[i].alive) arr.splice(i, 1);
    }

    static upLevel(val, max) {
        if (val < max) {
            return val + 1;
        } else {
            return val;
        }
    }

    static downLevel(val, min) {
        if (val > min) {
            return val - 1;
        } else {
            return val;
        }
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
}
