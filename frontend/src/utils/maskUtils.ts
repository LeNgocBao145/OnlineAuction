export const maskName = (name: string) => {
    if (!name) return "None";
    const trimmed = name.trim();

    // Handle email-like strings
    if (trimmed.includes("@")) {
        const [local, domain] = trimmed.split("@");
        if (local.length <= 3) return "****@" + domain;
        return local.substring(0, 2) + "****@" + domain;
    }

    const parts = trimmed.split(" ");
    if (parts.length === 1) {
        if (trimmed.length <= 3) return "****";
        return trimmed.substring(0, 2) + "****";
    }

    return `****${parts.at(-1)}`;
};
