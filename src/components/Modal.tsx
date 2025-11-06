import React, { useState } from 'react';
import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'

interface Photo {
    imageUrl: string;
    comment: string;
    location: string;
}

type Props = {
    photo: Photo;
    onClose: () => void;
};

const Modal: React.FC<Props> = ({ photo, onClose }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg p-5 md:p-6 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col text-center">
                <div className="relative flex items-center justify-center bg-neutral-100 rounded-md min-h-[200px] max-h-[calc(80vh-100px)] w-full overflow-hidden">

                    {!isLoaded && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Ring size="40" stroke="4" speed="2" color="#737373" />
                        </div>
                    )}

                    <img
                        src={photo.imageUrl}
                        alt={photo.comment}
                        onLoad={() => setIsLoaded(true)}
                        className={`
                            object-cover w-full h-auto max-h-[calc(80vh-100px)] transition-opacity duration-300 ease-in-out
                            ${isLoaded ? 'opacity-100' : 'opacity-0'}
                        `}
                    />
                </div>

                <p className="mt-4 text-base md:text-lg text-neutral-800">
                    {photo.comment}
                </p>
                <p className="mt-3 text-sm text-neutral-500">
                    撮影地：{photo.location}
                </p>

                <button
                    onClick={onClose}
                    className="mt-4 bg-neutral-700 text-white px-6 py-3 rounded-full cursor-pointer"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
};

export default Modal;