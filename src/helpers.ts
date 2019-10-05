
export function countCharactersBetween(text: string, characterToCount: string, startPos: number, endPos: number): number {
    var result = 0;
    var pos = startPos;
    while(pos < endPos) {
        var nextPos = text.indexOf(characterToCount, pos);
        if (nextPos === -1 || nextPos > endPos) {
            break;
        }

        result += 1;
        pos = nextPos + 1;
    }
    return result;
}