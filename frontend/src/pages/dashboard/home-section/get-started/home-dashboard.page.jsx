import batchesImage from '@/assets/images/batches.svg'
import bookImage from '@/assets/images/book.svg';
import institutionImage from '@/assets/images/institution.svg';
import studentImage from '@/assets/images/student.svg';
import teacherImage from '@/assets/images/teacher.svg';
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { CounterContext } from '@/components/Layout/commonLayout/TitleOfPageProvider';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import testImage from '@/assets/images/image.png';
import useStore from "@/store";
export default function GettingStartedPage() {
  const { user } = useStore();
  const navigate = useNavigate();
 const { updateBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    const breadcrumbData = [
      { label: "Dashboard" },
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);

  const links = [
    {
      color: '#E8F5E9',
      icon: <img src={batchesImage} alt="Batches" style={{ width: '30px', height: '28px' }} />,
      title: "Batches",
      description: 'View batches along with the creating teacher, followers, and joined students.',
      onClick: () => navigate('/batch'),
    },
    {
      color: '#BBDFE6',
      icon: <img src={teacherImage} alt="Teachers" style={{ width: '30px', height: '28px' }} />,
      title: "Teaching Staff",
      description: 'View teaching staff with their own batches and batches they follow.',
      onClick: () => navigate('/teacher/list'),
    },
    {
      color: '#CBBBE6',
      icon: <img src={studentImage} alt="Students" style={{ width: '30px', height: '28px' }} />,
      title: "Enrolled Students",
      description: ' View enrolled students, their batches, subjects, and update their status.',
      onClick: () => navigate('/student/list'),
    },
    {
      color: '#BBE6D3',
      icon: <img src={bookImage} alt="LMS" style={{ width: '30px', height: '28px' }} />,
      title: "Lesson Library",
      description: ' Add and manage lessons, topics, clips, and other content.',
      onClick: () => navigate('/lesson'),
    },
    {
      color: '#E6BBCE',
      icon: <img src={testImage} alt="test" style={{ width: '30px', height: '28px' }} />,
      title: "Question",
      description: 'Create online tests, offline tests, and lesson-based tests.',
      onClick: () => navigate('/test/list'),
    },
  ];
  const linksEditor = [
    
    {
      color: "#BBE6D3",
      icon: (
        <img
          src={bookImage}
          alt="LMS"
          style={{ width: "30px", height: "28px" }}
        />
      ),
      title: "Lesson Library",
      description: " Add and manage lessons, topics, clips, and other content.",
      onClick: () => navigate("/lesson"),
    },
    {
      color: "#E6BBCE",
      icon: (
        <img
          src={testImage}
          alt="test"
          style={{ width: "30px", height: "28px" }}
        />
      ),
      title: "Question",
      description:
        "Create online tests, offline tests, and lesson-based tests.",
      onClick: () => navigate("/test/list"),
    },
  ];
  return (
    <section className="w-full h-full flex flex-col gap-4">
      <section className=" bg-white shadow-md flex-grow overflow-hidden ">
        <div className="flex items-center justify-between gap-4 p-12 pb-0">
          <div className="flex flex-col gap-1 border-l-4 pl-4 border-blue-primary-200">
            <h1 className="text-2xl font-medium text-blue-primary-200">
              Welcome to Easy Padhai Portal
            </h1>
            <p className="leading-7 text-base text-gray-tertiary">
              Access this quick menu to navigate to the important parts of this
              system{" "}
            </p>
          </div>
        </div>
        <section className="mt-4 px-12 pt-4 scrollbar  h-[calc(100vh-71px-30px-114px)] ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start items-start">
            {user.userRole === "editor"
              ? linksEditor.map((item, idx) => (
                  <div
                    className="flex border-2 border-gray-quaternary/25 p-4 hover:bg-gray-quaternary/10 cursor-pointer w-full h-full"
                    key={idx}
                    onClick={item.onClick}
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      <span className="w-12 h-12 flex place-content-center items-center justify-center">
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1 ml-4 mr-2 w-fit">
                      <h2 className="text-sm text-gray-primary font-semibold">
                        {item.title}
                      </h2>
                      <p className="text-xs text-gray-tertiary">
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-auto w-5 h-5"></div>
                  </div>
                ))
              : links.map((item, idx) => (
                  <div
                    className="flex border-2 border-gray-quaternary/25 p-4 hover:bg-gray-quaternary/10 cursor-pointer w-full h-full"
                    key={idx}
                    onClick={item.onClick}
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      <span className="w-12 h-12 flex place-content-center items-center justify-center">
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1 ml-4 mr-2 w-fit">
                      <h2 className="text-sm text-gray-primary font-semibold">
                        {item.title}
                      </h2>
                      <p className="text-xs text-gray-tertiary">
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-auto w-5 h-5"></div>
                  </div>
                ))}
          </div>
        </section>
      </section>
    </section>
  );
}








// import React from "react";
// import { BookOpen, Users, GraduationCap, School, Layers } from "lucide-react"; // Use your icon set or SVGs
// import "./GetStartedPage.css"; // Optional: for custom styles
// import batchesImage from '@/assets/images/batches.svg'
// import bookImage from '@/assets/images/book.svg';
// import institutionImage from '@/assets/images/institution.svg';
// import studentImage from '@/assets/images/student.svg';
// import teacherImage from '@/assets/images/teacher.svg';
// import {
//   ButtonContainer,
//   Container,
//   Header,
//   Heading,
// } from '@/components/AddFormLayout/AddFormLayout';
// import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
// const cards = [
//   {
//     icon: <div className="w-[79px] h-[75px] bg-[#E8F5E9] flex items-center justify-center rounded"> <img src={batchesImage} alt="Batches" style={{ width: '30px', height: '28px' }} /></div>,
//     count: 10,
//     label: "Active Batches",
//     color: "#FFF",
//   },
//   {
//     icon: <div className="w-[79px] h-[75px] bg-[#BBDFE6] flex items-center justify-center rounded"> <img src={teacherImage} alt="Teachers" style={{ width: '30px', height: '28px' }} /></div>,
//     count: 52,
//     label: "Teaching Staff",
//     color: "#FFF",
//   },
//   {
//     icon: <div className="w-[79px] h-[75px] bg-[#CBBBE6] flex items-center justify-center rounded"><img src={studentImage} alt="Students" style={{ width: '30px', height: '28px' }} /></div>,
//     count: 421,
//     label: "Enrolled Students",
//     color: "#FFF",
//   },
//   {
//     icon: <div className="w-[79px] h-[75px] bg-[#BBE6D3] flex items-center justify-center rounded"><img src={bookImage} alt="LMS" style={{ width: '30px', height: '28px' }} /></div>,
//     count: 100,
//     label: "LMS",
//     color: "#FFF",
//   },
//   {
//     icon: <div className="w-[79px] h-[75px] bg-[#E6BBCE] flex items-center justify-center rounded"><img src={institutionImage} alt="Institutions" style={{ width: '30px', height: '28px' }} /></div>,
//     count: 40,
//     label: "Institutions",
//     color: "#FFF",
//   },
// ];

// const GetStartedPage = () => (
//     <Container>
//               <div className="">
//                 <>
//                   <Header>
//                     <div>
                     
//                       <Heading className=" ">
//                      Dashboard
//                       </Heading>
//                     </div>
                   
//                   </Header>
//   <div
//     className="add-v-form"
//     style={{ padding: "20px", justifyContent: "center" }}
//   >
//     <div className="width90">
     
//   <div className="add-v-form-right-section">
//     <div className="add-v-form-section">
//   <div className="getstarted-container border">
//               <div className="text-[36px] font-bold text-[#071C2B]">Welcome to Easy Padhai</div>
//     <div className="getstarted-cards">
//       {cards.map((card, idx) => (
//         <div className="getstarted-card border" key={idx} style={{ background: card.color }}>
//           <div className="getstarted-icon">{card.icon}</div>
//           <div className="getstarted-info">
//             <div className="getstarted-count">{card.count}</div>
//             <div className="getstarted-label">{card.label}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
//     </div>
//   </div>
//       </div>
//     </div>
  
//       </>
//    </div>
//             </Container>
// );

// export default GetStartedPage;