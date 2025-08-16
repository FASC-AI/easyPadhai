import React, { useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./IndicatorSlider.css";

import webslider1 from "../../../assets/images/webSlider1.png";
import webslider2 from "../../../assets/images/webSlider2.png";
import webslider3 from "../../../assets/images/webSlider3.png";
import logo from "../../../assets/images/whiteLogo.png";
import logo1 from "../../../assets/images/image-13.png";

const sliderData = [
  {
    image: webslider1,
    altText: "Easy Padhai",
    title: <>Easy Padhai: Making the learning eazy</>,
    description: <>Making the knowledge at finger tip</>,
    paragraph: <>Lets create learning easy together</>,
  },
  {
    image: webslider2,
    altText: "Easy Padhai",
    title: <>Easy Padhai: Making the learning eazy</>,
    description: <>Making the knowledge at finger tip</>,
    paragraph: <>Lets create learning easy together</>,
  },
  {
    image: webslider3,
    altText: "Easy Padhai",
    title: <>Easy Padhai: Making the learning eazy</>,
    description: <>Making the knowledge at finger tip</>,
    paragraph: <>Lets create learning easy together</>,
  },
];

const IndicatorSlider = () => {
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000, // 10 seconds
    cssEase: "ease-in-out",
    pauseOnHover: true,
    appendDots: (dots) => (
      <div>
        <ul className="custom-dots"> {dots} </ul>
      </div>
    ),
    customPaging: () => <button className="custom-dot"></button>,
  };

  // Debugging autoplay
  useEffect(() => {
    if (sliderRef.current) {
      try {
        sliderRef.current.slickPlay(); // Force autoplay start
        console.log("Slider autoplay initialized");
      } catch (error) {
        console.error("Error initializing slider autoplay:", error);
      }
    }
  }, []);

  return (
    <div className="slider-container">
      <Slider ref={sliderRef} {...settings}>
        {sliderData.map((slide, index) => (
          <div className="slider-img-div add-background" key={index}>
            <img
              className="slider-img opacity-90 object-cover w-full h-full"
              src={slide.image}
              alt={slide.altText}
            />
            <div className="setLogo flex items-center animate-fade-in">
              <img src={logo} alt="login logo" className="w-20 h-20 mr-4" />
              <div className="heading-600-26 c-white">{slide.title}</div>
            </div>
            <div className="image-title-para animate-fade-in">
              <div className="heading-600-24 c-white">{slide.description}</div>
              <div className="heading-400-16 c-white">{slide.paragraph}</div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default IndicatorSlider;
