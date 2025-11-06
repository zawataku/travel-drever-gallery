import React, { useState, useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Modal from '../components/Modal';
import LazyImage from '../components/LazyImage';
import { DotSpinner } from 'ldrs/react';
import 'ldrs/react/DotSpinner.css'

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
        return [...allPhotos].sort(() => 0.5 - Math.random()).slice(0, 8);
    }, [allPhotos]);

    const displayPhotos = selectedLocation === 'all' ? randomPhotos : filteredPhotos;

    const locations = useMemo(() => {
        if (!allPhotos) return [];
        return ['all', ...Array.from(new Set(allPhotos.map(p => p.location)))];
    }, [allPhotos]);

    if (loading) {
        return (
            <div className='py-6 px-2 md:px-6 flex flex-col items-center'>
                <div className='flex flex-col md:flex-row'>
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
                </div>
                <div className='flex justify-center items-center h-[80vh]'>
                    <DotSpinner size="60" speed="1.75" color="#737373" />
                </div>
            </div>
        )
    }
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className='py-6 px-2 md:px-6 flex flex-col items-center gap-12 text-neutral-800'>
            <div className='flex flex-col md:flex-row gap-0 md:gap-4'>
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
            </div>

            <div className='max-w-6xl flex flex-col items-center justify-center gap-2 px-3'>
                <h3 className='text-2xl md:text-3xl font-semibold'>- このサイトについて -</h3>
                <p className='text-base'>
                    金沢工業大学の公式マスコット、「ドリバーくん」のぬいぐるみと日本全国を旅している写真を集めました。<br />
                    新しい旅に出たら随時写真を更新していきます。
                </p>
            </div>
            <div className='max-w-6xl columns-2 lg:columns-3 gap-3 lg:gap-6'>
                {displayPhotos && displayPhotos.map(photo => (
                    <LazyImage
                        key={photo.id}
                        src={photo.imageUrl}
                        alt={photo.comment}
                        onClick={() => setModalPhoto(photo)}
                        className='w-full h-auto mb-3 lg:mb-6 rounded-lg md:rounded-xl cursor-pointer break-inside-avoid transition-all duration-300 hover:scale-105 hover:shadow-xl hover:rotate-1'
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