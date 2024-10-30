import React, { useState, useEffect } from "react"; // Ajouté useEffect
import { jsPDF } from "jspdf";
import { TierList } from './svg/tierList.svg';

export type Tier = {
  title: string;
  images?: string[];
  color: string;
  minNote?: number;
  maxNote?: number;
};

type TierListPDFProps = {
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
const TierListPDF = ({ tiers, withWaitList = false }: TierListPDFProps) => {

  /**
   * Hooks d'état pour gérer l'ouverture et la fermeture de la popup
   */
  const [openPopupTierList, setOpenPopupTierList] = useState<boolean>(false);

  /**
   * Hooks d'état pour gérer les tiers édités et l'index de couleur
   */
  const [editedTiers, setEditedTiers] = useState<Tier[]>([]);

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
    const initialTiers = [...tiers];
    if (showWaitlist) {
      const waitlistTier: Tier = {
        title: "Waitlist",
        color: "#CCCCCC",
        images: [],
      };
      initialTiers.push(waitlistTier);
    }
    setEditedTiers(initialTiers);
  }, [tiers, showWaitlist]);

  const openPopup = () => setOpenPopupTierList(true);
  const closePopup = () => setOpenPopupTierList(false);

  /**
   * Fonction pour gérer le changement d'un tier
   * @param {number} index - Index du tier
   * @param {string} field - Champ à modifier
   * @param {string | value} value - Valeur à assigner
   */
  const handleTierChange = (index: number, field: string, value: string | number) => {
    const updatedTiers = [...editedTiers];
    updatedTiers[index] = {
      ...updatedTiers[index],
      [field]: value
    };
    setEditedTiers(updatedTiers);
  };

  /**
   * Fonction pour ajouter un nouveau tier
   */
  const handleAddTier = () => {
    const nextColor = availableColors[colorIndex] || getRandomColor();
    setColorIndex(colorIndex + 1);

    const newTier: Tier = {
      title: "New Tier",
      color: nextColor,
      minNote: 0,
      maxNote: 10,
      images: [],
    };
    setEditedTiers([...editedTiers, newTier]);
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

    // Si la waitlist est cochée, effectuer un fetch pour obtenir les données
    if (showWaitlist) {
      try {
        const waitlistData = await fetchWaitlistData(); // Appel à la fonction de fetch
        // Traitez les données obtenues ici si nécessaire
        console.log("Waitlist data received:", waitlistData);
      } catch (error) {
        console.error("Error fetching waitlist data:", error);
      }
    }

    for (const tier of editedTiers) {
      const { title, images, color } = tier;
      const rgbColor = hexToRgb(color);
      const nbImages = images ? images.length : 0;
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
        if (!images) {
          return;
        }
        const imgDataArray = await loadImages(images);

        imgDataArray.forEach((imgData, index) => {
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
   * Fonction pour récupérer les séries de la waitlist
   * @returns 
   */
  const fetchWaitlistData = async () => {
    //TODO
  };
  
  /**
   * Fonction pour charger les images
   * @param {string[]} urls - Liste des URLs des images
   * @returns 
   */
  const loadImages = (urls: string[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const imagesUrl = "/api/images";

      fetch(imagesUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: urls }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error loading images");
          }
          return response.json();
        })
        .then((data) => {
          const base64Images = data.map((img: any) => img.image);
          resolve(base64Images);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <>
      <div onClick={openPopup}>
        <TierList width={40} height={40} />
      </div>
      {openPopupTierList && (
        <div className="popup-overlay">
          <div className="popup-content" style={{ position: 'relative' }}>
            <div className="close-icon" onClick={closePopup} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
              &#x2715;
            </div>

            {withWaitList !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="showWaitlist" checked={showWaitlist} onChange={() => setShowWaitlist(!showWaitlist)} className="input-switch" style={{ marginRight: '0.5rem' }}/>
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
                    <button className="tier-button-remove" onClick={() => handleRemoveTier(index)}>Remove</button>
                  )}
                </div>
              )
            ))}

            <button className="tier-button-validate" onClick={handleAddTier}>Add New Tier</button>
            <button className="tier-button-validate" onClick={generatePDF}>Generate Tier List</button>
          </div>
        </div>
      )}
    </>
  );
};

export default TierListPDF;
