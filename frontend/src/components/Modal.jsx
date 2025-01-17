import { useRef } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-[2500]'
      onClick={handleOverlayClick}
      id='overlay'
    >
      <div
        className='bg-white rounded-lg w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh] p-6 relative'
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            strokeWidth='2'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
        <div className='h-[99%]' id='modal-content'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
