export function sanitizeIdentifier(raw) {
    if (!raw || typeof raw !== "string") return "";
    let s = raw.trim().toLowerCase();
    s = s.replace(/[^a-z0-9_]+/g, "_");
    s = s.replace(/^[^a-z_]+/, "");
    if (s.length > 60) s = s.slice(0, 60);
    s = s.replace(/[^a-z0-9_]/g, "");
    if (!s) throw new Error("Invalid identifier after sanitization");
    return s;
}
