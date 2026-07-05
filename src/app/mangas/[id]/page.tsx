"use client";

import { useCallback, useEffect, useState, use } from 'react';
import Loader from '@/components/loader';
import { BrokenHeart, Heart } from '@/components/svg/heart.svg';
import { Star, StarColored, StarHalfColored } from '@/components/svg/stars.svg';
import { useUserContext } from '@/userContext';
import { Manga } from '@/types/mangas.type';
import TagList from '@/components/tagList';
import { getCatalogPosterSrc } from '@/lib/catalog-item';

export default function MangaDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, setAlert, setSelectedMenu } = useUserContext();

    const [manga, setManga] = useState<Manga | undefined>(undefined);
    const [fetchDataFinished, setFetchDataFinished] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [showMore, setShowMore] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [followDate, setFollowDate] = useState<string | null>(null);
    const [isChangeDate, setIsChangeDate] = useState(false);
    const [isWaited, setIsWaited] = useState(false);

    const fetchManga = async () => {
        const response = await fetch(`/api/mangas/${encodeURIComponent(id)}`);
        if (!response.ok) {
            setAlert(await response.json());
            return;
        }

        const data: Manga = await response.json();
        if (user) {
            const userResponse = await fetch(`/api/mangas/${encodeURIComponent(id)}/user/${encodeURIComponent(user.id)}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                data.note = userData.note !== null && userData.note !== undefined ? { note: userData.note } : undefined;
                data.follow_date = userData.follow_date;
                data.comment = userData.comment;
                setRating(userData.note ?? 0);
                setFollowDate(userData.follow_date);
                setIsWaited(Boolean(userData.is_waited));
            }
        }

        setManga(data);
        setFetchDataFinished(true);
    };

    const onClickHeart = async () => {
        if (!user || !manga) return;
        const route = `/api/${encodeURIComponent(user.web_token)}/mangas/${manga.follow_date ? 'un' : ''}follow`;
        const response = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mangaId: manga.id }),
        });
        if (response.ok) {
            await fetchManga();
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: user.login }),
            });
        } else {
            setAlert({ message: 'Erreur lors de la récupération des mangas suivis', valid: false });
        }
    };

    const onClickHourGlass = async () => {
        if (!user || !manga) return;
        const route = `/api/${encodeURIComponent(user.web_token)}/mangas/${isWaited ? 'un' : ''}waited`;
        const response = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mangaId: manga.id }),
        });
        if (response.ok) {
            await fetchManga();
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: user.login }),
            });
        } else {
            setAlert({ message: 'Erreur lors de la récupération des mangas en attente', valid: false });
        }
    };

    const updateVote = async () => {
        if (!user || !manga) return;
        const note = rating ?? 0;
        const comment = (document.getElementById('manga-comment') as HTMLTextAreaElement).value;
        const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/mangas/${encodeURIComponent(manga.id)}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note, comment, newVote: manga.note === undefined }),
        });
        if (response.ok) {
            await fetchManga();
            setAlert({ message: 'Vote ajouté', valid: true });
        } else {
            setAlert({ message: 'Erreur lors de l\'ajout du vote', valid: false });
        }
    };

    const updateDateFollow = async () => {
        if (!user || !manga) return;
        if (!followDate) return setAlert({ message: 'Veuillez renseigner une date et une heure', valid: false });

        const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/mangas/follow/date`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mangaId: manga.id, newDate: new Date(followDate) }),
        });

        if (response.ok) {
            await fetchManga();
            setAlert({ message: 'Date de suivi modifiée', valid: true });
        } else {
            setAlert({ message: 'Erreur lors de la modification de la date de suivi', valid: false });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (isEditing) setIsEditing(false);
            if (isChangeDate) updateDateFollow();
            setIsChangeDate(false);
        }
        if (event.key === 'Escape' || event.key === 'Backspace') {
            setIsEditing(false);
            setIsChangeDate(false);
            setFollowDate(null);
        }
    };

    const handleMouseEnter = (index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const halfWidth = rect.width / 2;
        const newHoverRating = x < halfWidth ? index + 0.5 : index + 1;
        setHoverRating(newHoverRating);
    };

    const getStarIcon = (index: number) => {
        if (hoverRating !== null) {
            return hoverRating >= index + 1 ? <StarColored width={30} height={30} /> : hoverRating > index ? <StarHalfColored width={30} height={30} /> : <Star width={30} height={30} />;
        }
        return rating >= index + 1 ? <StarColored width={30} height={30} /> : rating > index ? <StarHalfColored width={30} height={30} /> : <Star width={30} height={30} />;
    };

    const formatRating = (value: number) => (value % 1 === 0 ? `${value}.0` : value.toFixed(1));
    const truncateText = (text: string, length: number) => text.length > length ? `${text.substring(0, length)}...` : text;

    useEffect(() => { fetchManga(); }, [id, user]);
    useEffect(() => { setSelectedMenu(''); }, [setSelectedMenu]);

    if (!fetchDataFinished || !manga) return <Loader />;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {[...Array(10)].map((_, index) => (
                            <span key={index} onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const x = e.clientX - rect.left; const halfWidth = rect.width / 2; setRating(x < halfWidth ? index + 0.5 : index + 1); }} onMouseEnter={(e) => handleMouseEnter(index, e)} onMouseLeave={() => setHoverRating(null)} onMouseMove={(e) => handleMouseEnter(index, e)} style={{ cursor: 'pointer' }}>
                                {getStarIcon(index)}
                            </span>
                        ))}
                        {isEditing ? (
                            <input type="number" value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} onBlur={() => setIsEditing(false)} onKeyDown={handleKeyDown} min="0" max="10" step="0.5" style={{ fontSize: '1.6rem', fontWeight: 'bold', width: '70px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '6px', outline: 'none' }} />
                        ) : (
                            <>
                                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', cursor: 'pointer' }} tabIndex={0} onClick={() => setIsEditing(true)}>{formatRating(rating)}</span>
                                <button onClick={() => { updateVote(); setIsEditing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '-2px', fontSize: '1rem', color: 'var(--button-color)' }}>✎</button>
                            </>
                        )}
                    </div>
                )}
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <span onClick={onClickHeart} style={{ display: 'flex', alignItems: 'center' }}>{manga.follow_date ? <Heart width={30} height={30} /> : <BrokenHeart width={30} height={30} />}</span>
                        {isChangeDate ? (
                            <input type="datetime-local" value={followDate ? new Date(followDate).toISOString().slice(0, 16) : manga.follow_date ? new Date(manga.follow_date).toISOString().slice(0, 16) : ''} onChange={(e) => setFollowDate(e.target.value)} onBlur={() => setIsChangeDate(false)} onKeyDown={handleKeyDown} style={{ fontSize: '1.2rem', fontWeight: 'bold', width: 'auto', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '6px', outline: 'none' }} />
                        ) : (
                            <span onClick={() => setIsChangeDate(true)} style={{ fontWeight: 'bold' }}>{manga.follow_date ? `Suivi depuis le ${new Date(manga.follow_date).toLocaleDateString()}` : 'Suivre ce manga'}</span>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <img src={getCatalogPosterSrc(manga.cover_image, 'mangas')} alt={manga.title_english || manga.title_romaji || ''} style={{ width: '300px', height: '450px', borderRadius: '10px', objectFit: 'cover', boxShadow: 'var(--shadow-light)' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '20px', backgroundColor: 'var(--above)', borderRadius: '10px', padding: '20px', boxShadow: 'var(--shadow-light)' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--titre-color)', marginBottom: '10px', textShadow: '1px 1px 2px hsla(0, 0%, 0%, 0.10)' }}>{manga.title_english || manga.title_romaji || manga.title_native}</h2>
                        {manga.status === 'FINISHED' && <p style={{ color: 'red', fontWeight: 'bold' }}>Ce manga est terminé</p>}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Nom original:</strong> {manga.title_native || manga.title_english || manga.title_romaji}</p>
                                {manga.title_romaji && <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Romaji:</strong> {manga.title_romaji}</p>}
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Status:</strong> {manga.status}</p>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Format:</strong> {manga.format}</p>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Date de début:</strong> {manga.start_date ? new Date(manga.start_date).toLocaleDateString() : '-'}</p>
                                {manga.end_date && (
                                    <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Date de fin:</strong> {new Date(manga.end_date).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Chapitres:</strong> {manga.chapters ?? 0}</p>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Volumes:</strong> {manga.volumes ?? '-'}</p>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Note moyenne:</strong> {manga.meanScore ?? manga.averageScore ?? 0}</p>
                                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}><strong>Genres:</strong> {manga.genres.map((genre) => genre.name).join(', ')}</p>
                            </div>
                        </div>
                        <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}><strong>Synopsis:</strong></p>
                        <p style={{ fontSize: '1rem', color: 'var(--main-text-color)', marginBottom: '20px' }}>
                            {showMore ? manga.synopsis : truncateText(manga.synopsis, 250)}
                            {manga.synopsis.length > 250 && (
                                <button onClick={() => setShowMore(!showMore)} style={{ color: 'var(--button-color)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                    {showMore ? 'Voir moins' : 'Voir plus'}
                                </button>
                            )}
                        </p>
                        <TagList tags={manga.tags} title="Tags" />
                    </div>

                    {showMoreInfo ? (
                        <div style={{ marginBottom: '40px' }}>
                            <button onClick={() => setShowMoreInfo(false)} style={{ padding: '10px 20px', backgroundColor: 'var(--button-color)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Voir moins</button>
                        </div>
                    ) : (
                        <button onClick={() => setShowMoreInfo(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--button-color)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Voir plus de détails</button>
                    )}
                </div>
            </div>

            {user && (
                <div style={{ marginTop: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--titre-color)', marginBottom: '20px' }}>Commentaire</h2>
                    <textarea id="manga-comment" defaultValue={manga.comment || ''} style={{ width: '100%', height: '150px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem', color: 'var(--titre-color)', backgroundColor: 'var(--above)' }} />
                    <button onClick={updateVote} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: 'var(--button-color)', color: 'var(--header-footer-text)', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mettre à jour le commentaire</button>
                </div>
            )}
        </div>
    );
}
