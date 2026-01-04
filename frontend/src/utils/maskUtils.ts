/**
 * Mask a name by replacing random characters with asterisks
 * Keeps first character of each word visible, masks ~50% of remaining characters at random positions
 */
export const maskName = (name: string): string => {
    if (!name) return "None";
    const trimmed = name.trim();

    // Handle email-like strings
    if (trimmed.includes("@")) {
        const [local, domain] = trimmed.split("@");
        return maskWord(local) + "@" + domain;
    }

    const parts = trimmed.split(" ");

    // Mask each word separately, preserving spaces
    return parts.map(word => maskWord(word)).join(" ");
};

/**
 * Mask a single word by replacing random characters with asterisks
 * Always keeps the first character visible
 */
const maskWord = (word: string): string => {
    if (!word || word.length <= 1) return word;

    const chars = word.split("");
    const length = chars.length;

    // Always keep first character visible
    // For remaining characters, randomly mask about 50% of them
    const remainingIndices: number[] = [];
    for (let i = 1; i < length; i++) {
        remainingIndices.push(i);
    }

    // Shuffle using seeded random based on word (so same name always masks the same way)
    const seed = word.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = shuffleWithSeed(remainingIndices, seed);

    // Mask approximately 50% of the remaining characters
    const numToMask = Math.ceil((length - 1) * 0.5);
    const indicesToMask = new Set(shuffled.slice(0, numToMask));

    return chars.map((char, i) => indicesToMask.has(i) ? "*" : char).join("");
};

/**
 * Shuffle array using a seeded random for consistent results
 */
const shuffleWithSeed = (array: number[], seed: number): number[] => {
    const result = [...array];
    let currentSeed = seed;

    const seededRandom = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
};
