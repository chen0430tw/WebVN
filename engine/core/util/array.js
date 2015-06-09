WebVN.extend('util', function (exports)
{
    var arrProto = Array.prototype;

    /**
     * Index of elem in the specific array.
     * @method indexOf
     * @memberof util
     * @param {Array} arr
     * @param item
     * @return {Number}
     */
    exports.indexOf = function (arr, item)
    {
        return arrProto.indexOf.call(arr, item);
    };

    /**
     * Whether an element is in the specific array.
     * @method inArray
     * @memberof util
     * @param {Array} arr
     * @param item
     * @return {Boolean}
     */
    exports.inArray = function (arr, item)
    {
        return exports.indexOf(arr, item) > -1;
    };
});