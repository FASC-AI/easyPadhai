import { useState } from 'react';

import './ShowImageGridView.css';

const ShowImageGridView = ({ images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (img) => {
    setSelectedImage(img);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="section-shadow">
      <div className="w-100 p-3 flex justify-between show-image-title">
{/*        
        <div className="curser-pointer">
          {upDownArrow({ width: 24, height: 24 })}
        </div> */}
      </div>
      <div className="w-100 p-3 flex justify-between img-gv-detail-container">
        {images?.map((img) => (
          <div className="img-gv-detail-box" key={img.url}>
            <div
              className="img-gv-container"
              onClick={() => handleImageClick(img)}
            >
              <img
                src={img.url}
                alt={img.name}
                style={{
                  height: '150px',
                  width: '350px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div className="img-gv-name">
              <div className="heading-400-14 c-blue1">{img.name}</div>{' '}
              {/* <span className="img-threedot">
                {dotIcon({ width: 24, height: 24 })}
              </span> */}
            </div>
          </div>
        ))}
        {images?.length === 0 && (
          <div className="img-gv-detail-box">
            <div className="img-gv-container">
              <img
                src={'/assets/images/bus-images-dummy.svg'}
                alt={'bus-images-dummy'}
                style={{ height: '150px', width: '320px', objectFit: 'cover' }}
              />
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              X
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowImageGridView;
