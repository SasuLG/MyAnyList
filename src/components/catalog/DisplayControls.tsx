import { Settings, ToggleLayout, IncreaseSize, DecreaseSize } from '@/components/svg/buttons.svg';
import TierListGenerator from '../tierListGenerator';
import { CatalogItem } from '@/types/catalog-item.type';

interface Props {
    buttonsVisible: boolean;
    rotating: boolean | undefined;
    styleType: 'grid' | 'list';

    toggleButtonsVisibility: () => void;
    setRotating: React.Dispatch<React.SetStateAction<boolean | undefined>>;

    toggleLayout: () => void;
    increaseSize: () => void;
    decreaseSize: () => void;
    mode: 'mangas' | 'series';

    filteredSeries?: CatalogItem[];
}

export default function DisplayControls({ buttonsVisible, rotating, styleType, toggleButtonsVisibility, setRotating, toggleLayout, increaseSize, decreaseSize, mode, filteredSeries }: Props) {

    return (
        <>
            <button
                onClick={() => { toggleButtonsVisibility(); setRotating(prev => !prev) }}
                style={{
                    backgroundColor: "var(--above)",
                    position: 'absolute',
                    top: '4rem',
                    right: '1rem',
                    border: "1px solid var(--border-color)",
                    borderRadius: "5px",
                    padding: "0.6rem 1.2rem",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-light)",
                    zIndex: 1000,
                    fontSize: '0.9rem',
                    fontWeight: 'normal',
                    color: "var(--text-color)",
                    transition: "background-color 0.3s, color 0.3s",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Settings width={20} height={20} rotating={rotating} />
            </button>

            <div className={`buttons-container ${buttonsVisible ? "show" : "hide"}`} style={{ position: 'absolute', top: '7rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1000 }}>
                <button
                    style={{
                        backgroundColor: "var(--above)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "5px",
                        padding: "0.5rem",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-light)",
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={toggleLayout}
                >
                    <ToggleLayout width={25} height={25} checked={styleType === "grid"} />
                </button>

                <button
                    style={{
                        backgroundColor: "var(--above)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "5px",
                        padding: "0.5rem",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-light)",
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={increaseSize}
                >
                    <IncreaseSize width={25} height={25} />
                </button>

                <button
                    style={{
                        backgroundColor: "var(--above)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "5px",
                        padding: "0.5rem",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-light)",
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={decreaseSize}
                >
                    <DecreaseSize width={25} height={25} />
                </button>
                <button
                    style={{ border: "1px solid var(--border-color)", borderRadius: "5px", backgroundColor: "var(--above)", cursor: "pointer", boxShadow: "var(--shadow-light)", opacity: 0.8, transition: "opacity 0.3s, background-color 0.3s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = "1"} onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"} >
                    {filteredSeries && filteredSeries.length > 0 && (
                        <TierListGenerator mode={mode} allSeries={filteredSeries || []}
                            tiers={[
                                {
                                    title: "Banger",
                                    color: "#ff7f7f",
                                    minNote: 9.5,
                                    maxNote: 10,
                                },
                                {
                                    title: "Amazing",
                                    color: "#ffbf7f",
                                    minNote: 8.5,
                                    maxNote: 9.49,
                                },
                                {
                                    title: "Very good",
                                    color: "#ffdf7f",
                                    minNote: 7.5,
                                    maxNote: 8.49,
                                },
                                {
                                    title: "Good",
                                    color: "#FFFF7F",
                                    minNote: 6.5,
                                    maxNote: 7.49,
                                },
                                {
                                    title: "Ok Tier",
                                    color: "#bfff7f",
                                    minNote: 5,
                                    maxNote: 6.49,
                                },
                                {
                                    title: "Bof Tier",
                                    color: "#7fff7f",
                                    minNote: 3.5,
                                    maxNote: 4.99,
                                },
                                {
                                    title: "Bad Tier",
                                    color: "#7fffff",
                                    minNote: 2,
                                    maxNote: 3.49,
                                },
                                {
                                    title: "Shit Tier",
                                    color: "#7fbfff",
                                    minNote: 0,
                                    maxNote: 1.99,
                                }
                            ]} />
                    )}
                    {/* #ff7f7f, #ffbf7f, #ffdf7f, #FFFF7F, #bfff7f, #7fff7f */}
                    {/* #7fffff, #7fbfff, #7f7fff, #ff7fff */}
                </button>
            </div >
        </>
    );
}