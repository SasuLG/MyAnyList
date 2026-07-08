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


  // Exclure les couleurs déjà utilisées pour les nouveaux tiers
  const usedColors = new Set(tiers.map(tier => tier.color));
  const availableColors = predefinedColors.filter(color => !usedColors.has(color));

  /**
   * Effet pour initialiser les tiers édités
   */
  useEffect(() => {
    const nonWaitlistTiers = editedTiers.filter(tier => tier.title !== "Waitlist");

    const finalTiers = showWaitlist
      ? [...nonWaitlistTiers, { title: "Waitlist", color: "#CCCCCC", images: [] }]
      : [...nonWaitlistTiers];

    setEditedTiers(finalTiers);
  }, [showWaitlist]);

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

  // Mettre à jour les images d'un tier quand les notes changent
  const handleTierChange = (index: number, field: string, value: string | number) => {
    setEditedTiers(prev => {
      const updated = [...prev];
      const currentTier = { ...updated[index], [field]: value };

      // Si on change une note, on recalcule les images de CE tier
      if (field === 'minNote' || field === 'maxNote') {
        currentTier.images = getImagesForRange(
          field === 'minNote' ? (value as number) : (currentTier.minNote || 0),
          field === 'maxNote' ? (value as number) : (currentTier.maxNote || 10)
        );
      }

      updated[index] = currentTier;
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
      images: getImagesForRange(min, max), // On calcule les images dès l'ajout
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

    // Fond général en noir clair
    doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F'); // Remplit tout le fond de la page

    let waitlistImages = [];
    if (showWaitlist) {
      waitlistImages = await fetchWaitlistData();
    }

    for (const tier of editedTiers) {
      let images = tier.images || [];
      if (tier.title === "Waitlist") {
        images = waitlistImages;
      }
      const { title, color } = tier;
      const rgbColor = hexToRgb(color);
      const nbImages = images.length;
      const imagesPerRow = Math.floor((pageWidth - titleWidth) / (imageWidth + spaceBetweenImages));
      const totalRowsNeeded = Math.ceil(nbImages / imagesPerRow);
      const rowCount = nbImages > 0 ? totalRowsNeeded : 1;

      // Fond de la section des images
      doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.rect(titleWidth, yPos, pageWidth - titleWidth, imageHeight * rowCount, 'F');

      // Fond de la colonne des titres
      doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
      doc.rect(0, yPos, titleWidth, imageHeight * rowCount, 'F');

      // Texte du titre au milieu
      const textWidth = doc.getTextWidth(title);
      const tierTextYPos = yPos + (imageHeight * rowCount) / 2;
      let xPos = (titleWidth / 2) - (textWidth / 2);
      doc.setTextColor(0, 0, 0);
      doc.text(title, xPos, tierTextYPos, { baseline: "middle" });

      // Séparateur vertical
      doc.setFillColor(0, 0, 0);
      doc.rect(titleWidth, yPos, verticalSeparatorWidth, imageHeight * rowCount, 'F');

      // Ajout des images
      xPos = titleWidth;
      try {
        const imgDataArray = await loadImages(images);

        imgDataArray.forEach((imgData, index) => {
          if (imgData) { // Vérifie que imgData n'est pas undefined
            doc.addImage(imgData, "PNG", xPos, yPos, imageWidth, imageHeight);
            xPos += imageWidth + spaceBetweenImages;

            if ((index + 1) % imagesPerRow === 0) {
              xPos = titleWidth;
              yPos += imageHeight;

              if (yPos + imageHeight > pageHeight) {
                doc.addPage();
                yPos = 0;

                // Fond général en noir clair pour la nouvelle page
                doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
                doc.rect(0, 0, pageWidth, pageHeight, "F");
              }
            }
          }
        });
      } catch (error) {
        console.error("Error loading images:", error);
      }

      yPos += imageHeight;

      // Séparateur horizontal
      doc.setFillColor(0, 0, 0);
      doc.rect(0, yPos, pageWidth, separatorHeight, 'F');
      yPos += separatorHeight;

      // Gérer le cas où il n'y a pas assez d'espace pour ajouter plus d'images
      if (yPos + imageHeight > pageHeight) {
        doc.addPage();
        yPos = 0;

        // Fond général en noir clair pour la nouvelle page
        doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      }
    }

    doc.save("tierlist.pdf");
  };

  /**
  * Fonction pour charger les images par lots
  * @param {string[]} urls - Liste des URLs des images
  * @returns 
  */
  const loadImages = async (urls: string[]): Promise<string[]> => {
    const batchSize = 10;
    const results = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      const batchUrls = urls.slice(i, i + batchSize);
      try {
        const batchResult = await fetchImages(batchUrls);
        results.push(...batchResult);
      } catch (error) {
        console.error("Erreur lors du chargement d'un lot d'images:", error);
      }
    }
    return results;
  };

  /**
  * Fonction pour récupérer les images à partir de l'API
  * @param {string[]} urls - Liste des URLs des images
  * @returns 
  */
  const fetchImages = (urls: string[]): Promise<string[]> => {
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
        return data.map((img: { image: string }) => img ? img.image : "defaultImageBase64");
      });
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

            <button className="tier-button-validate" onClick={handleAddTier}>Add New Tier</button>
            <button className="tier-button-validate" onClick={generatePDF}>Generate Tier List</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TierListPDF;