import React, { useState, useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Modal from '../components/Modal';

interface Photo {
    id: string;
    imageUrl: string;
    comment: string;
    location: string;
    createdAt: Timestamp;
}

const HomePage: React.FC = () => {

    const photosCollection = collection(db, 'photos');
    const q = query(photosCollection, orderBy('createdAt', 'desc'));
    const [allPhotos, loading, error] = useCollectionData<Photo>(q, { idField: 'id' });
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);

    const filteredPhotos = useMemo(() => {
        if (!allPhotos) return [];
        if (selectedLocation === 'all') {
            return allPhotos;
        }
        return allPhotos.filter(photo => photo.location === selectedLocation);
    }, [allPhotos, selectedLocation]);

    const randomPhotos = useMemo(() => {
        if (!allPhotos) return [];
        return [...allPhotos].sort(() => 0.5 - Math.random()).slice(0, 10);
    }, [allPhotos]);

    const displayPhotos = selectedLocation === 'all' ? randomPhotos : filteredPhotos;

    const locations = useMemo(() => {
        if (!allPhotos) return [];
        return ['all', ...Array.from(new Set(allPhotos.map(p => p.location)))];
    }, [allPhotos]);


    if (loading) return <p>Loading gallery...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h2>旅するドリバーぬい写真展</h2>

            <div>
                <label>撮影地で絞り込む: </label>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                    {locations.map(loc => (
                        <option key={loc} value={loc}>
                            {loc === 'all' ? 'すべて' : loc}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                {displayPhotos && displayPhotos.map(photo => (
                    <img
                        key={photo.id}
                        src={photo.imageUrl}
                        alt={photo.comment}
                        onClick={() => setModalPhoto(photo)}
                    />
                ))}
            </div>

            {modalPhoto && (
                <Modal photo={modalPhoto} onClose={() => setModalPhoto(null)} />
            )}
        </div>
    );
};

export default HomePage;