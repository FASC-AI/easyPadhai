/**
 * Disables the right-click context menu on the element where this event is attached.
 *
 * @param {Event} event - The event triggered when the user attempts to right-click.
 */

export const disableRightClick = (event) => {
  event.preventDefault();
};
