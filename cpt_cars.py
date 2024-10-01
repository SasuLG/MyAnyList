import os

EXTENSIONS = ['.tsx', '.css', '.ts']

def count_characters_in_file(file_path):
    """Compte le nombre de caractères dans un fichier donné."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return sum(len(line) for line in file)  # Compte les caractères dans chaque ligne
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier {file_path}: {e}")
        return 0

def count_characters_in_directory(directory):
    """Compte les caractères dans tous les fichiers avec les extensions spécifiées dans le dossier et ses sous-dossiers."""
    total_characters = 0

    for root, _, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                file_path = os.path.join(root, file)
                characters_in_file = count_characters_in_file(file_path)
                total_characters += characters_in_file
                print(f"{file_path}: {characters_in_file} caractères")

    return total_characters

if __name__ == "__main__":
    directory = 'src'
    total_characters = count_characters_in_directory(directory)
    print(f"Nombre total de caractères dans les fichiers spécifiés : {total_characters}")
