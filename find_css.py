import os
import re

EXTENSIONS = ['.css','.tsx', '.ts']

# Liste basique des couleurs nommées CSS à vérifier
CSS_COLOR_NAMES = [
    "white", "black", "red", "blue", "green", "yellow", "gray", "grey",
    "orange", "purple", "pink", "brown", "cyan", "magenta", "lime",
    "navy", "teal", "olive", "maroon", "silver", "gold", "beige"
]

# Regex pour détecter les hexadécimaux et couleurs nommées
HEX_COLOR_REGEX = re.compile(r'#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b')
NAMED_COLOR_REGEX = re.compile(r'\b(?:' + '|'.join(CSS_COLOR_NAMES) + r')\b', re.IGNORECASE)

def check_colors_in_file(file_path):
    """Cherche des couleurs en dur dans un fichier CSS (sauf src/app/globals.css)."""
    results = []

    # On exclut explicitement src/app/globals.css
    if os.path.normpath(file_path).endswith(os.path.normpath("src/app/globals.css")):
        return results

    # if os.path.normpath(file_path).endswith(os.path.normpath("src/components/seriesList.tsx")):
    #     return results
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            for line_num, line in enumerate(file, start=1):
                if HEX_COLOR_REGEX.search(line) or NAMED_COLOR_REGEX.search(line):
                    results.append((file_path, line_num, line.strip()))
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier {file_path}: {e}")

    return results


def check_colors_in_directory(directory):
    """Parcourt les fichiers CSS et affiche les couleurs en dur trouvées."""
    all_results = []

    for root, _, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                file_path = os.path.join(root, file)
                results = check_colors_in_file(file_path)
                all_results.extend(results)

    return all_results


if __name__ == "__main__":
    directory = 'src'
    results = check_colors_in_directory(directory)

    if results:
        print("Couleurs en dur trouvées :\n")
        for file_path, line_num, line in results:
            print(f"{file_path} (ligne {line_num}) : {line}")

        print(f"\nTotal : {len(results)} couleur(s) en dur trouvée(s).")
    else:
        print("✅ Aucune couleur en dur trouvée (hors src/app/globals.css).")
