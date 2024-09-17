import os

EXTENSIONS = ['.tsx', '.css', '.ts']

def count_lines_in_file(file_path):
    """Compte le nombre de lignes dans un fichier donné."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return sum(1 for _ in file)
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier {file_path}: {e}")
        return 0

def count_lines_in_directory(directory):
    """Compte les lignes de code dans tous les fichiers avec les extensions spécifiées dans le dossier et ses sous-dossiers."""
    total_lines = 0

    for root, _, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                file_path = os.path.join(root, file)
                lines_in_file = count_lines_in_file(file_path)
                total_lines += lines_in_file
                print(f"{file_path}: {lines_in_file} lignes")

    return total_lines

if __name__ == "__main__":
    directory = 'src'
    total_lines = count_lines_in_directory(directory)
    print(f"Nombre total de lignes dans les fichiers spécifiés : {total_lines}")
