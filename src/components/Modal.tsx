import React from 'react';

interface Photo {
    imageUrl: string;
    comment: string;
    location: string;
}

type Props = {
    photo: Photo;
    onClose: () => void;
};

const modalBackdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '90vw',
    maxHeight: '90vh',
};

const modalImageStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: 'calc(90vh - 100px)',
    objectFit: 'contain',
};

const Modal: React.FC<Props> = ({ photo, onClose }) => {

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div style={modalBackdropStyle} onClick={handleBackdropClick}>
            <div style={modalContentStyle}>
                <img src={photo.imageUrl} alt={photo.comment} style={modalImageStyle} />
                <p>{photo.comment} ({photo.location})</p>
                <button onClick={onClose}>閉じる</button>
            </div>
        </div>
    );
};

export default Modal;