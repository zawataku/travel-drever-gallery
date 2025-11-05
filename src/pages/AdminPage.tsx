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

        } catch (err: any) {
            console.error(err);
            if (err.code === 'storage/unauthorized') {
                setMessage('エラー: アップロードする権限がありません。');
            } else {
                setMessage(`エラー: ${err.message || 'アップロードに失敗しました。'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>管理者ページ</h2>
            <p>ようこそ{user?.email} さん</p>
            <button onClick={() => signOut(auth)}>ログアウト</button>

            <hr style={{ margin: '20px 0' }} />

            <h3>写真アップロード</h3>
            <form onSubmit={handleUpload}>
                <div>
                    <label>写真ファイル: </label>
                    <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} required />
                </div>
                <div>
                    <label>コメント: </label>
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} required />
                </div>
                <div>
                    <label>撮影地: </label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading || !file}>
                    {loading ? '処理中...' : 'アップロード'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AdminPage;