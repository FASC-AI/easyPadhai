export function getInitials(name) {
    const parts = name.split(' ');
    const initials = parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
}