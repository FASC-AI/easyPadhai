
import React, { useState, useEffect, useCallback } from "react";

const ImageSliderFB = ({ images, autoChangeInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const goToNext = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images?.length); // loop back to 0 after the last image
      setFadeIn(true);
    }, 500);
  }, [images?.length]);

  const goToSlide = (index) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFadeIn(true);
    }, 500);
  };

  useEffect(() => {
    const changeInterval = setInterval(goToNext, autoChangeInterval);
    return () => clearInterval(changeInterval);
  }, [goToNext, autoChangeInterval]);

  if (!images || images.length === 0) {
    return <div>No images available</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className={`absolute w-full h-full transition-opacity duration-500 
        `
        }
      >
        <img
          src={images[currentIndex]}
          alt={`slide-${currentIndex}`}
          className="object-cover w-full h-full opacity-60"
        />
      </div>

      <div className="absolute top-10 left-38 transform -translate-x-1/2    px-6 py-3 ">
        <div className="flex h-14 w-14 items-center justify-center rounded-md text-primary-foreground">
          <img
            className="w-100"
            src="/logo1.svg"
            alt="logo1.svg"
          />
        </div>
        <div className="text-[#0a0a0a] text-2xl">Welcome to Our Site</div>
      </div>
      <div className="absolute bottom-5 left-52 transform -translate-x-1/2 text-white   px-4 py-2 ">
        <div className="text-2xl">
          Explore beauty of our collection
        </div>
        <div className="text-1xl">
          Explore the beauty of our collection
        </div>
      </div>
      {/* Dots for navigation */}
      <div className="absolute bottom-10 right-2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 border border-white cursor-pointer ${currentIndex === index ? "w-5 bg-white" : "bg-transparent"
              }`}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImageSliderFB;
