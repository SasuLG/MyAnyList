import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { TierList } from './svg/tierList.svg';
import { useUserContext } from "@/userContext";
import { IMG_SRC } from "@/constants/tmdb.consts";
import { createPortal } from "react-dom";
import { CatalogItem } from "@/types/catalog-item.type";
import { getCatalogPosterSrc } from "@/lib/catalog-item";

export type Tier = {
  title: string;
  images?: string[];
  color: string;
  minNote?: number;
  maxNote?: number;
};

type TierListPDFProps = {
  mode: "mangas" | "series";
  allSeries: CatalogItem[];
  tiers: Tier[];
  withWaitList?: boolean;
};

// Liste des couleurs prédéfinies
const predefinedColors = [
  "#ff7f7f", "#ffbf7f", "#ffdf7f", "#FFFF7F",
  "#bfff7f", "#7fff7f", "#7fffff", "#7fbfff",
  "#7f7fff", "#ff7fff"
];

/**
 * Fonction pour obtenir une couleur aléatoire
 * @returns 
 */
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Fonction pour convertir une couleur hexadécimale en RGB
 * @param hex 
 * @returns 
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

/**
 * Composant pour générer un PDF à partir d'une liste de tiers
 * @param {Tier} tiers - Liste des tiers
 * @returns 
 */
const TierListPDF = ({ tiers, withWaitList = false, mode, allSeries }: TierListPDFProps) => {

  /**
   * Récupérer les informations de l'utilisateur
   */
  const { user } = useUserContext();

  /**
   * Hooks d'état pour gérer l'ouverture et la fermeture de la popup
   */
  const [openPopupTierList, setOpenPopupTierList] = useState<boolean>(false);

  /**
   * Hooks d'état pour gérer les tiers édités et l'index de couleur
   */
  const [editedTiers, setEditedTiers] = useState<Tier[]>(tiers);

  /**
   * Hooks d'état pour gérer l'index de couleur et l'affichage de la liste d'attente
   */
  const [colorIndex, setColorIndex] = useState<number>(0);

  /**
   * Hooks d'état pour gérer l'affichage de la liste d'attente
   */
  const [showWaitlist, setShowWaitlist] = useState<boolean>(withWaitList);

  /**
   * Hooks d'état pour gérer la génération du PDF
   */
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationLabel, setGenerationLabel] = useState<string>("Generate Tier List");


  // Exclure les couleurs déjà utilisées pour les nouveaux tiers
  const usedColors = new Set(editedTiers.map(tier => tier.color));
  const availableColors = predefinedColors.filter(color => !usedColors.has(color));

  const buildTiersWithWaitlist = (baseTiers: Tier[], includeWaitlist: boolean): Tier[] => {
    const nonWaitlistTiers = baseTiers.filter(tier => tier.title !== "Waitlist");
    if (!includeWaitlist) {
      return nonWaitlistTiers;
    }

    return [...nonWaitlistTiers, { title: "Waitlist", color: "#CCCCCC", images: [] }];
  };

  /**
   * Effet pour synchroniser les tiers édités avec les props et les filtres actifs
   */
  useEffect(() => {
    setEditedTiers(buildTiersWithWaitlist(tiers, showWaitlist));
  }, [tiers, showWaitlist]);

  const openPopup = () => setOpenPopupTierList(true);
  const closePopup = () => setOpenPopupTierList(false);

  // Fonction utilitaire pour récupérer les images selon les notes
  const getImagesForRange = (min: number, max: number) => {
    return allSeries
      .filter(serie => {
        const note = serie.note ?? 0;
        return note >= min && note <= max;
      })
      .sort((a, b) => (b.note ?? 0) - (a.note ?? 0))
      .map(serie => getCatalogPosterSrc(serie.poster_path, mode));
  };

  // Mettre à jour les propriétés d'un tier
  const handleTierChange = (index: number, field: string, value: string | number) => {
    setEditedTiers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Ajouter un nouveau tier avec calcul d'images immédiat
  const handleAddTier = () => {
    const nextColor = availableColors[colorIndex] || getRandomColor();
    setColorIndex(colorIndex + 1);

    const min = 0;
    const max = 10;

    const newTier: Tier = {
      title: "New Tier",
      color: nextColor,
      minNote: min,
      maxNote: max,
      images: [],
    };

    if (showWaitlist) {
      const tiersSansWaitlist = editedTiers.filter(t => t.title !== "Waitlist");
      const waitlistTier = editedTiers.find(t => t.title === "Waitlist")!;
      setEditedTiers([...tiersSansWaitlist, newTier, waitlistTier]);
    } else {
      setEditedTiers([...editedTiers, newTier]);
    }
  };

  /**
   * Fonction pour supprimer un tier
   * @param {number} index - Index du tier à supprimer
   */
  const handleRemoveTier = (index: number) => {
    const tierTitle = editedTiers[index].title;
    const confirmation = window.confirm(`Êtes-vous sûr de vouloir supprimer le tier "${tierTitle}" ?`);

    if (confirmation) {
      const updatedTiers = editedTiers.filter((_, i) => i !== index);
      setEditedTiers(updatedTiers);
    }
  };

  /**
   * Fonction pour générer le PDF
   * @returns 
   */
  const generatePDF = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationLabel("Preparation...");

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const imageWidth = 15.24;
    const imageHeight = 20;
    const spaceBetweenImages = 0;
    const titleWidth = 27;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const darkGray = [30, 30, 30];
    const separatorHeight = 0.5;
    const verticalSeparatorWidth = 0.5;
    let yPos = 0;
    doc.setFontSize(14);
    const imagesPerRow = Math.max(1, Math.floor((pageWidth - titleWidth - verticalSeparatorWidth) / (imageWidth + spaceBetweenImages)));

    const paintPageBackground = () => {
      doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    // Fond général en noir clair
    paintPageBackground();

    try {
      let waitlistImages: string[] = [];
      if (showWaitlist) {
        waitlistImages = await fetchWaitlistData();
      }

      const tiersToRender = editedTiers
        .filter(tier => showWaitlist || tier.title !== "Waitlist")
        .map(tier => {
          if (tier.title === "Waitlist") {
            return { ...tier, images: waitlistImages };
          }

          return {
            ...tier,
            images: getImagesForRange(tier.minNote ?? 0, tier.maxNote ?? 10)
          };
        });

      const allImageUrls = Array.from(
        new Set(
          tiersToRender.flatMap(tier => tier.images || [])
        )
      );

      setGenerationLabel("Loading images...");
      const imageDataMap = await loadImageMap(allImageUrls);
      setGenerationLabel("Building PDF...");

      for (const tier of tiersToRender) {
        const { title, color } = tier;
        const rgbColor = hexToRgb(color);
        const resolvedImages = (tier.images || [])
          .map(imageUrl => imageDataMap.get(imageUrl))
          .filter((img): img is string => Boolean(img));

        const rows: string[][] = [];
        for (let i = 0; i < resolvedImages.length; i += imagesPerRow) {
          rows.push(resolvedImages.slice(i, i + imagesPerRow));
        }
        if (rows.length === 0) {
          rows.push([]);
        }

        let rowCursor = 0;
        while (rowCursor < rows.length) {
          if (yPos + imageHeight > pageHeight) {
            doc.addPage();
            yPos = 0;
            paintPageBackground();
          }

          const remainingRows = rows.length - rowCursor;
          const rowsFitInPage = Math.max(1, Math.floor((pageHeight - yPos) / imageHeight));
          const rowsInThisPage = Math.min(rowsFitInPage, remainingRows);
          const sectionHeight = rowsInThisPage * imageHeight;

          // Fond de la section des images
          doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.rect(titleWidth, yPos, pageWidth - titleWidth, sectionHeight, 'F');

          // Fond de la colonne des titres (répété sur chaque page)
          doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
          doc.rect(0, yPos, titleWidth, sectionHeight, 'F');

          // Texte du titre centré sur chaque segment de page
          const textWidth = doc.getTextWidth(title);
          const tierTextYPos = yPos + sectionHeight / 2;
          const tierTextXPos = (titleWidth / 2) - (textWidth / 2);
          doc.setTextColor(0, 0, 0);
          doc.text(title, tierTextXPos, tierTextYPos, { baseline: "middle" });

          // Séparateur vertical
          doc.setFillColor(0, 0, 0);
          doc.rect(titleWidth, yPos, verticalSeparatorWidth, sectionHeight, 'F');

          let rowYPos = yPos;
          for (let row = 0; row < rowsInThisPage; row++) {
            const rowImages = rows[rowCursor + row];
            let xPos = titleWidth + verticalSeparatorWidth;

            rowImages.forEach((imgData) => {
              doc.addImage(imgData, "PNG", xPos, rowYPos, imageWidth, imageHeight);
              xPos += imageWidth + spaceBetweenImages;
            });

            rowYPos += imageHeight;
          }

          yPos += sectionHeight;
          rowCursor += rowsInThisPage;

          if (rowCursor < rows.length) {
            doc.addPage();
            yPos = 0;
            paintPageBackground();
          }
        }

        // Séparateur horizontal en fin de tier
        if (yPos + separatorHeight > pageHeight) {
          doc.addPage();
          yPos = 0;
          paintPageBackground();
        }

        doc.setFillColor(0, 0, 0);
        doc.rect(0, yPos, pageWidth, separatorHeight, 'F');
        yPos += separatorHeight;
      }

      doc.save("tierlist.pdf");
    } catch (error) {
      console.error("Error generating tier list PDF:", error);
    } finally {
      setIsGenerating(false);
      setGenerationLabel("Generate Tier List");
    }
  };

  /**
  * Fonction pour récupérer les images à partir de l'API
  * @param {string[]} urls - Liste des URLs des images
  * @returns
  */
  const fetchImages = (urls: string[]): Promise<(string | undefined)[]> => {
    return fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrls: urls })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des images");
        }
        return response.json();
      })
      .then(data => {
        return data.map((img: { image: string }) => img ? img.image : undefined);
      });
  };

  /**
  * Fonction pour charger les images en parallèle avec cache
  * @param {string[]} urls - Liste des URLs des images
  * @returns
  */
  const loadImageMap = async (urls: string[]): Promise<Map<string, string>> => {
    const imageMap = new Map<string, string>();
    if (urls.length === 0) {
      return imageMap;
    }

    const batchSize = 24;
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    const results = await Promise.all(
      batches.map(async (batchUrls) => {
        try {
          const batchImages = await fetchImages(batchUrls);
          return { batchUrls, batchImages };
        } catch (error) {
          console.error("Erreur lors du chargement d'un lot d'images:", error);
          return { batchUrls, batchImages: [] as (string | undefined)[] };
        }
      })
    );

    results.forEach(({ batchUrls, batchImages }) => {
      batchUrls.forEach((url, index) => {
        const image = batchImages[index];
        if (image) {
          imageMap.set(url, image);
        }
      });
    });

    return imageMap;
  };

  /**
   * Fonction pour récupérer les images des séries de la waitlist
   * @returns 
   */
  const fetchWaitlistData = async () => {
    if (!user) return [];

    try {
      const response = await fetch(`/api/user/${encodeURIComponent(user.id)}/series/image?waitList=${encodeURIComponent(true)}`);
      let data = await response.json();
      data = data.map((img: string) => IMG_SRC + img);

      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données de la waitlist:", error);
      return [];
    }
  };


  return (
    <>
      <div onClick={openPopup}>
        <TierList width={40} height={40} />
      </div>
      {openPopupTierList && createPortal(
        <div className="popup-overlay">
          <div className="popup-content" style={{ position: 'relative' }}>
            <div className="close-icon" onClick={closePopup} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
              &#x2715;
            </div>

            {withWaitList !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="showWaitlist" checked={showWaitlist} onChange={() => setShowWaitlist(!showWaitlist)} className="input-switch" style={{ marginRight: '0.5rem' }} />
                <label htmlFor="showWaitlist" className="switch" />
                <span>Avec Waitlist</span>
              </div>
            )}


            {editedTiers.map((tier, index) => (
              tier.title === "Waitlist" && !showWaitlist ? null : (
                <div key={index} className="tier-editor">
                  <input type="text" value={tier.title} onChange={(e) => handleTierChange(index, 'title', e.target.value)} placeholder="Tier Name" />
                  <input type="color" value={tier.color} onChange={(e) => handleTierChange(index, 'color', e.target.value)} />
                  {tier.title !== "Waitlist" && (
                    <>
                      <input type="number" step="0.01" value={tier.minNote || 0} onChange={(e) => handleTierChange(index, 'minNote', parseFloat(e.target.value))} placeholder="Min Note" />
                      <input type="number" step="0.01" value={tier.maxNote || 10} onChange={(e) => handleTierChange(index, 'maxNote', parseFloat(e.target.value))} placeholder="Max Note" />
                    </>
                  )}
                  {tier.title !== "Waitlist" && (
                    <div className="tier-button-remove" onClick={() => handleRemoveTier(index)} style={{ cursor: 'pointer' }}>Remove</div>
                  )}
                </div>
              )
            ))}

            <button className="tier-button-validate" onClick={handleAddTier} disabled={isGenerating}>Add New Tier</button>
            <button
              className="tier-button-validate"
              onClick={generatePDF}
              disabled={isGenerating}
              style={isGenerating ? {
                border: "2px solid transparent",
                borderRadius: "10px",
                background: "linear-gradient(var(--above), var(--above)) padding-box, linear-gradient(90deg, #ff7f7f, #ffbf7f, #ffdf7f, #7fbfff, #ff7f7f) border-box",
                backgroundSize: "100% 100%, 250% 100%",
                animation: "tierlist-rainbow-border 1.8s linear infinite",
                cursor: "wait"
              } : undefined}
            >
              {generationLabel}
            </button>
          </div>
        </div>,
        document.body
      )}
      <style jsx>{`
        @keyframes tierlist-rainbow-border {
          0% {
            background-position: 0% 0%, 0% 50%;
          }
          100% {
            background-position: 0% 0%, 200% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default TierListPDF;