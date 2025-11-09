import React, { useState, useCallback, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    Timestamp,
    limit,
    startAfter,
    getDocs,
    where,
    DocumentSnapshot
} from 'firebase/firestore';
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

const PHOTOS_PER_PAGE = 5;

const HomePage: React.FC = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);

    const [locationsList, setLocationsList] = useState<string[]>(['all']);

    useEffect(() => {
        const fetchAllLocations = async () => {
            try {
                const photosCollection = collection(db, 'photos');
                const q = query(photosCollection);
                const querySnapshot = await getDocs(q);

                const allLocations = querySnapshot.docs.map(doc => doc.data().location as string);
                const uniqueLocations = ['all', ...Array.from(new Set(allLocations))];

                setLocationsList(uniqueLocations);
            } catch (err) {
                console.error("場所リストの取得に失敗:", err);
            }
        };
        fetchAllLocations();
    }, []);

    const fetchPhotos = useCallback(async (location: string, cursor: DocumentSnapshot | null = null) => {

        const isPaginationMode = location === 'all';

        if (cursor) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setPhotos([]);
        }

        const photosCollection = collection(db, 'photos');
        let q = query(photosCollection, orderBy('createdAt', 'desc'));

        if (isPaginationMode) {
            if (cursor) {
                q = query(q, startAfter(cursor));
            }
            q = query(q, limit(PHOTOS_PER_PAGE));
            setHasMore(true);
        } else {
            q = query(q, where('location', '==', location));
            setHasMore(false);
            setLastVisible(null);
        }

        try {
            const querySnapshot = await getDocs(q);
            const newPhotos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Photo));

            if (isPaginationMode) {
                setPhotos(prevPhotos => cursor ? [...prevPhotos, ...newPhotos] : newPhotos);

                const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                setLastVisible(lastDoc);

                if (querySnapshot.docs.length < PHOTOS_PER_PAGE) {
                    setHasMore(false);
                }
            } else {
                setPhotos(newPhotos);
            }

        } catch (err) {
            console.error("Firestore query error:", err);
            setPhotos([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);
    useEffect(() => {
        fetchPhotos(selectedLocation, null);
    }, [selectedLocation, fetchPhotos]);

    if (loading && photos.length === 0) {
        return (
            <div className='py-6 px-2 md:px-6 flex flex-col items-center gap-7 text-neutral-800'>
                <div className='flex flex-col md:flex-row gap-0 md:gap-4'>
                    <h2>旅するドリバーぬい</h2>
                </div>
                <div className='flex justify-center items-center h-[80vh]'>
                    <DotSpinner size="60" speed="1.75" color="#737373" />
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-4xl py-6 px-2 md:px-6 flex flex-col items-center gap-7 text-neutral-800'>
            <div className='flex flex-col md:flex-row gap-0 md:gap-4'>
                <h2>旅するドリバーぬい</h2>
            </div>

            <div className='flex flex-col items-center justify-center gap-4 px-3'>
                <h3 className='text-2xl md:text-3xl font-semibold'>～このサイトについて～</h3>
                <p className='text-sm md:text-base'>
                    金沢工業大学の公式マスコット「ドリバーくん」のぬいぐるみと日本全国を旅している写真を集めました。<br />
                    新しい旅に出たら随時写真を更新していきます。
                </p>
            </div>

            <hr className="w-full my-3 border-neutral-400" />

            <div className="w-full flex items-center justify-center gap-3">
                <label
                    htmlFor="location-select"
                    className="text-sm font-medium text-neutral-600"
                >
                    撮影地で絞り込む:
                </label>
                <select
                    id="location-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="block w-auto px-4 py-2 text-base text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 cursor-pointer"
                >
                    {locationsList.map(loc => (
                        <option key={loc} value={loc} className="text-neutral-900">
                            {loc === 'all' ? 'すべて' : loc}
                        </option>
                    ))}
                </select>
            </div>

            <div className='columns-2 lg:columns-3 gap-3 lg:gap-6'>
                {photos.map(photo => (
                    <LazyImage
                        key={photo.id}
                        src={photo.imageUrl}
                        alt={photo.comment}
                        onClick={() => setModalPhoto(photo)}
                        className='w-full h-auto mb-3 lg:mb-6 rounded-lg md:rounded-xl cursor-pointer break-inside-avoid transition-all duration-300 hover:scale-105 hover:shadow-xl hover:rotate-1'
                    />
                ))}
            </div>

            <div className="flex justify-center items-center">
                {hasMore && !loadingMore && (
                    <button
                        onClick={() => fetchPhotos(selectedLocation, lastVisible)}
                        className="bg-neutral-700 text-white px-6 py-3 rounded-full cursor-pointer"
                    >
                        もっと読み込む
                    </button>
                )}
                {loadingMore && (
                    <DotSpinner size="50" speed="1.75" color="#737373" />
                )}
                {/* {!hasMore && photos.length > 0 && selectedLocation !== 'all' && (
                    <p className="text-neutral-500">{selectedLocation}の写真は以上です</p>
                )}
                {!hasMore && photos.length > 0 && selectedLocation === 'all' && (
                    <p className="text-neutral-500">これ以上写真はありません</p>
                )}
                {photos.length === 0 && !loading && (
                    <p className="text-neutral-500">この場所の写真はありません</p>
                )} */}
            </div>
            <hr className="w-full my-8 border-neutral-400" />
            <p className='text-sm md:text-base text-neutral-400'>
                ※このWebサイトはファンが個人で制作したものであり、金沢工業大学とは一切関係ありません。
            </p>

            {modalPhoto && (
                <Modal photo={modalPhoto} onClose={() => setModalPhoto(null)} />
            )}
        </div>
    );
};

export default HomePage;