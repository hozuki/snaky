export default abstract class CommonUtils {

    /**
     * Generate a string based on the template, and provided values. This function acts similarly to the String.Format()
     * function in CLR.
     * @param format {String} The template string.
     * @param replaceWithArray {*[]} The value array to provide values for formatting.
     * @example
     * var person = { name: "John Doe", age: 20 };
     * console.log(_util.formatString("{0}'s age is {1}.", person.name, person.age);
     * @returns {String} The generated string, with valid placeholders replaced by values matched.
     */
    static formatString(format: string, ...replaceWithArray: any[]): string {
        const replaceWithArrayIsNull = !replaceWithArray;
        const replaceWithArrayLength = replaceWithArrayIsNull ? -1 : replaceWithArray.length;

        function stringFormatter(matched: string): string {
            const indexString = matched.substring(1, matched.length - 1);
            const indexValue = parseInt(indexString);

            if (!replaceWithArrayIsNull && (0 <= indexValue && indexValue < replaceWithArrayLength)) {
                if (typeof replaceWithArray[indexValue] === "undefined") {
                    return "undefined";
                } else if (replaceWithArray[indexValue] === null) {
                    return "null";
                } else {
                    return replaceWithArray[indexValue].toString();
                }
            } else {
                return matched;
            }
        }

        const regex = /{[\d]+}/g;
        return format.replace(regex, stringFormatter);
    }

}