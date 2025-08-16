import PropTypes from "prop-types";

/**
 * PublicLayout component
 * This component serves as a layout wrapper for public-facing pages.
 *
 * @param {object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within this layout.
 * @returns {JSX.Element} The rendered layout component.
 */
export default function PublicLayout({ children }) {
  return <div>{children}</div>;
}

// Define PropTypes for validation
PublicLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensures children are provided
};
