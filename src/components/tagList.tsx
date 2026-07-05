import { useState } from 'react';

type TagLike = { id?: string | number; name: string };

type TagListProps = {
    tags: TagLike[];
    title?: string;
    maxVisible?: number;
};

export default function TagList({ tags, title = 'Tags', maxVisible = 8 }: TagListProps) {
    const [showAll, setShowAll] = useState(false);

    if (!tags.length) return null;

    const visibleTags = showAll ? tags : tags.slice(0, maxVisible);

    return (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--above)', boxShadow: 'var(--shadow-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: 'var(--titre-color)', fontSize: '1.1rem' }}>{title}</h3>
                {tags.length > maxVisible && (
                    <button
                        type="button"
                        onClick={() => setShowAll(prev => !prev)}
                        style={{ border: 'none', background: 'none', color: 'var(--button-color)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                    >
                        {showAll ? 'Voir moins' : `Voir plus (${tags.length})`}
                    </button>
                )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {visibleTags.map((tag) => (
                    <span
                        key={tag.id ?? tag.name}
                        style={{
                            padding: '0.35rem 0.7rem',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--main-text-color)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            fontSize: '0.9rem'
                        }}
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
        </div>
    );
}
