export default class Utils {
    static prune(arr) {
        let i = arr.length;
        while (i--) if (!arr[i].alive) arr.splice(i, 1);
    }
}
