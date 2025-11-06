import React, { useState } from 'react';
import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'

interface LazyImageProps {
    src: string;
    alt: string;
    className: string;
    onClick: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden ${className}`}
        >
            {!isLoaded && (
                <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
                    <Ring size="40" stroke="5" speed="2" color="#737373" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`w-full h-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
};

export default LazyImage;