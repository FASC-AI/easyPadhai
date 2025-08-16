/* eslint-disable react/prop-types */

const Container = ({ children }) => (  <div className="bg-white shadow-lg overflow-auto ">


    {children}
  </div>
);

const TableContainer = ({ children }) => (
  <div className=" bg-white pb-5 shadow-lg overflow-hidden">
    {children}
  </div>
);

/** ---------- HEADER COMPONENTS ------------- */
const Header = ({ style = {}, children }) => (
  <div
    style={style}
    className=" flex justify-between pb-5 border-b border-[#D8D8D8] md:p-5 sticky-header"
  >
    {children}
  </div>
);

const Heading = ({ children }) => (
  <div className=" heading-600-24 text-[#1A6FAB] v-center pt-7x ml-4">{children}</div>
);

const ButtonContainer = ({ children }) => (
  <div className="mx-4 add-v-form-top-button flex flex-col md:flex-row gap-15px">
    {children}
  </div>
);
/** ---------- HEADER COMPONENTS ------------- */

/** ---------- INPUT SECTION COMPONENTS ------------- */
const Content = ({ children }) => (
  <div className="mx-4 md:p-5">{children}</div>
);

const Section = ({ children }) => (
  <div className="mx-4 flex gap-4 w-full pt-8 md:pt-10 md:gap-10">{children}</div>
);

const Content1 = ({ children }) => (
  <div className="mx-4 add-v-form-bottom-section" style={{ paddingBottom: '20px' }}>
    {children}
  </div>
);

const SidePanel = ({ title, description }) => (

  <div className=" add-v-form-left-section md:w-1/4">

    <div className="heading-600-16 c-blue1 md:whitespace-nowrap">{title}</div>
    {description ? (
      <div className="heading-400-12 c-gray2">{description}</div>
    ) : null}
  </div>
);

const InputsContainer = ({ children }) => (
  <div className="mx-4 flex flex-col gap-2 w-full">{children}</div>
);
/** ---------- INPUT SECTION COMPONENTS ------------- */

export {
  ButtonContainer,
  Container,
  Content,
  Content1,
  Header,
  Heading,
  InputsContainer,
  Section,
  SidePanel,
  TableContainer,
};
