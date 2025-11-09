import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const AdminPage: React.FC = () => {
    const [user] = useAuthState(auth);
    const [file, setFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage('ファイルを選択してください');
            return;
        }
        if (!comment || !location) {
            setMessage('コメントと撮影地を入力してください');
            return;
        }

        setLoading(true);
        setMessage('アップロード準備中...');

        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `photos/${uuidv4()}.${fileExtension}`;
            const storageRef = ref(storage, fileName);

            setMessage('Firebase Storageにアップロード中...');

            const uploadResult = await uploadBytes(storageRef, file)
            const publicUrl = await getDownloadURL(uploadResult.ref);

            setMessage('Firestoreにメタデータを保存中...');

            const photosCollection = collection(db, 'photos');
            await addDoc(photosCollection, {
                imageUrl: publicUrl,
                comment: comment,
                location: location,
                createdAt: serverTimestamp(),
            });

            setMessage('アップロードが完了しました！');
            setFile(null);
            setComment('');
            setLocation('');
            (e.target as HTMLFormElement).reset();

        } catch (err: unknown) {
            console.error(err);

            if (err instanceof Error) {
                const error = err as Error & { code?: string };

                if (error.code === 'storage/unauthorized') {
                    setMessage('エラー: アップロードする権限がありません。');
                } else {
                    setMessage(`エラー: ${error.message || 'アップロードに失敗しました。'}`);
                }
            } else {
                setMessage(`エラー: ${String(err) || 'アップロードに失敗しました。'}`);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className='flex flex-col p-2 md:p-3 justify-center items-center min-h-screen'>
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg mx-auto p-6 md:p-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">管理者ページ</h2>
                    <button
                        onClick={() => signOut(auth)}
                        className="text-neutral-700 underline-offset-2 cursor-pointer underline transition-colors text-sm font-medium"
                    >
                        ログアウト
                    </button>
                </div>
                <p className="mb-8 text-neutral-600">ようこそ {user?.email} さん</p>

                <hr className="my-8 border-neutral-200" />

                <h3 className="text-2xl font-semibold mb-6">写真アップロード</h3>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-neutral-700 mb-2">
                            写真ファイル (jpeg, png)
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleFileChange}
                            required
                            className="block w-full text-sm text-neutral-900 border border-neutral-300 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-tl-lg file:rounded-bl-lg file:border-y-0 file:border-l-0 file:border-r file:border-neutral-300 file:text-sm file:font-semibold file:bg-neutral-50 file:text-neutral-700 hover:file:bg-neutral-200"
                        />
                    </div>

                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
                            コメント
                        </label>
                        <input
                            id="comment"
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            className="block bg-white w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                            撮影地
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 disabled:bg-neutral-400 disabled:cursor-not-allowed"
                    >
                        {loading ? '処理中...' : 'アップロード'}
                    </button>
                </form>

                {message && (
                    <p className={`mt-6 text-center font-medium ${message.includes('エラー') ? 'text-red-600' : 'text-green-600'
                        }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminPage;