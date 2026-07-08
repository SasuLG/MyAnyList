import os
import json
import webbrowser

IGNORE_DIRS = {
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    ".turbo",
    ".cache",
    "coverage",
    "__pycache__",
    ".vscode",
    ".idea"
}

IGNORE_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml"
}

# ============================================================
# DETECTION TYPE PROJET
# ============================================================

def detect_project_type(root):
    package_json = os.path.join(root, "package.json")

    if not os.path.exists(package_json):
        return "Projet inconnu"

    try:
        with open(package_json, "r", encoding="utf-8") as f:
            data = json.load(f)

        deps = {}
        deps.update(data.get("dependencies", {}))
        deps.update(data.get("devDependencies", {}))

        if "next" in deps:
            return "Next.js"
        if "react" in deps:
            return "React"
        if "@nestjs/core" in deps:
            return "NestJS"
        if "vue" in deps:
            return "Vue.js"
        if "@angular/core" in deps:
            return "Angular"

    except Exception:
        pass

    return "Projet JavaScript"

# ============================================================
# IGNORE
# ============================================================

def should_ignore(path):
    name = os.path.basename(path)
    return name in IGNORE_DIRS or name in IGNORE_FILES

# ============================================================
# ARBORESCENCE TEXTE
# ============================================================

def build_tree(directory, prefix=""):
    lines = []

    try:
        items = sorted(
            os.listdir(directory),
            key=lambda x: (
                not os.path.isdir(os.path.join(directory, x)),
                x.lower()
            )
        )
    except PermissionError:
        return []

    items = [
        i for i in items
        if not should_ignore(os.path.join(directory, i))
    ]

    for i, item in enumerate(items):
        path = os.path.join(directory, item)
        last = i == len(items) - 1

        connector = "└── " if last else "├── "

        if os.path.isdir(path):
            lines.append(prefix + connector + item + "/")
            extension = "    " if last else "│   "
            lines.extend(build_tree(path, prefix + extension))
        else:
            lines.append(prefix + connector + item)

    return lines

# ============================================================
# MERMAID GENERATION
# ============================================================

def generate_mermaid(directory):
    lines = ["graph TD"]
    node_id = 0
    node_infos = {}

    def walk(path, parent=None):
        nonlocal node_id

        current = f"N{node_id}"
        node_id += 1

        label = os.path.basename(path) or path
        label = label.replace('"', '').replace("'", "")

        full_path = os.path.abspath(path)

        node_infos[current] = {
            "name": label,
            "path": full_path,
            "type": "Dossier" if os.path.isdir(path) else "Fichier",
        }

        if os.path.isfile(path):
            try:
                node_infos[current]["size"] = os.path.getsize(path)
            except:
                node_infos[current]["size"] = 0
        else:
            node_infos[current]["size"] = 0

        lines.append(f'{current}["{label}"]')

        if parent:
            lines.append(f"{parent} --> {current}")

        if os.path.isdir(path):
            try:
                children = sorted(os.listdir(path))
            except:
                return

            for c in children:
                child_path = os.path.join(path, c)

                if should_ignore(child_path):
                    continue

                walk(child_path, current)

    walk(directory)

    return ("\n".join(lines),json.dumps(node_infos))

# ============================================================
# HTML INTERACTIF (ZOOM + DRAG)
# ============================================================
def generate_html(mermaid_content, node_infos):

    html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Project Explorer</title>

<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({{
    startOnLoad: true,
    securityLevel: 'loose'
}});
</script>

<style>

body {{
    margin: 0;
    overflow: hidden;
    font-family: Arial;
    background: #0f172a;
    color: white;
}}

#toolbar {{
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 10;
    background: #1e293b;
    padding: 10px;
    border-radius: 10px;
    display: flex;
    gap: 5px;
}}

#search {{
    padding: 5px;
    border-radius: 6px;
    border: none;
    outline: none;
    width: 180px;
}}

button {{
    cursor: pointer;
}}

#container {{
    width: 100vw;
    height: 100vh;
    cursor: grab;
    overflow: hidden;
}}

#content {{
    transform-origin: 0 0;
}}

#inspector {{
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: #1e293b;
    padding: 10px;
    border-radius: 10px;
    min-width: 250px;
}}

.node-highlight rect,
.node-highlight polygon,
.node-highlight path {{
    fill: #facc15 !important;
    stroke: #f97316 !important;
    stroke-width: 5px !important;
}}

.node-highlight {{
    filter: drop-shadow(0 0 20px #facc15);
}}
@keyframes pulse {{
    0%   {{ filter: drop-shadow(0 0 5px #facc15); }}
    50%  {{ filter: drop-shadow(0 0 25px #facc15); }}
    100% {{ filter: drop-shadow(0 0 5px #facc15); }}
}}

.node-highlight {{
    animation: pulse 1s infinite;
}}

</style>
</head>

<body>

<div id="toolbar">
    <input id="search" placeholder="Rechercher..." oninput="searchNode(this.value)" />
    <button onclick="zoomIn()">➕</button>
    <button onclick="zoomOut()">➖</button>
    <button onclick="resetView()">Reset</button>
</div>

<div id="container">
    <div id="content">
        <pre class="mermaid" id="graph">
{mermaid_content}
        </pre>
    </div>
</div>

<div id="inspector">
    <div><b>Fichier sélectionné</b></div>
    <div id="info">Clique sur un node</div>
</div>
<script>

const NODE_INFOS = {node_infos};

</script>
<script>

let scale = 1;
let x = 0;
let y = 0;

const container = document.getElementById("container");
const content = document.getElementById("content");
const info = document.getElementById("info");

function update() {{
    content.style.transform = `translate(${{x}}px, ${{y}}px) scale(${{scale}})`;
}}

function zoomIn() {{
    scale *= 1.2;
    update();
}}

function zoomOut() {{
    scale /= 1.2;
    update();
}}

function resetView() {{
    scale = 1;
    x = 0;
    y = 0;
    update();
}}

// DRAG
let dragging = false;
let startX, startY;

container.addEventListener("mousedown", (e) => {{
    dragging = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
    container.style.cursor = "grabbing";
}});

container.addEventListener("mouseup", () => {{
    dragging = false;
    container.style.cursor = "grab";
}});

container.addEventListener("mousemove", (e) => {{
    if (!dragging) return;
    x = e.clientX - startX;
    y = e.clientY - startY;
    update();
}});

container.addEventListener("wheel", (e) => {{
    e.preventDefault();
    scale *= e.deltaY < 0 ? 1.1 : 0.9;
    update();
}}, {{ passive: false }});

// SEARCH (simple highlight text)
function searchNode(value) {{

    const nodes = document.querySelectorAll(".node");

    nodes.forEach(node => {{

        const label = node.textContent.toLowerCase();

        node.classList.remove("node-highlight");

        if (
            value &&
            label.includes(value.toLowerCase())
        ) {{
            node.classList.add("node-highlight");
        }}
    }});
}}

// CLICK detection (Mermaid SVG)
document.addEventListener("click", (e) => {{

    const node = e.target.closest(".node");
    console.log(node.id);
    if (!node) return;

    const match = node.id.match(/N\d+/);

    if (!match) return;

    const nodeId = match[0];

    const data = NODE_INFOS[nodeId];
    console.log(data);

    if (!data) return;

    info.innerHTML = `
        <div><b>Nom :</b> ${{data.name}}</div>
        <div><b>Type :</b> ${{data.type}}</div>
        <div><b>Taille :</b> ${{data.size}} octets</div>
        <hr>
        <div style="word-break:break-all;">
            <b>Chemin :</b><br>
            ${{data.path}}
        </div>
    `;
}});

</script>

</body>
</html>
"""


    with open("diagram.html", "w", encoding="utf-8") as f:
        f.write(html)

# ============================================================
# MAIN
# ============================================================

def main():

    root = input("Chemin du projet : ").strip()#src

    if not os.path.isdir(root):
        print("Répertoire invalide")
        return

    project_type = detect_project_type(root)

    # STRUCTURE TEXTE
    tree = [
        "# Structure du projet",
        "",
        f"Type détecté : {project_type}",
        "",
        "```text",
        os.path.basename(os.path.abspath(root))
    ]

    tree.extend(build_tree(root))
    tree.append("```")

    with open("structure.md", "w", encoding="utf-8") as f:
        f.write("\n".join(tree))

    # MERMAID
    mermaid, node_infos = generate_mermaid(root)

    with open("diagramme.mmd", "w", encoding="utf-8") as f:
        f.write(mermaid)

    # HTML INTERACTIF
    generate_html(mermaid, node_infos)

    print("✅ structure.md généré")
    print("✅ diagramme.mmd généré")
    print("✅ diagram.html généré")

    webbrowser.open("diagram.html")


if __name__ == "__main__":
    main()



# import os
# import json

# IGNORE_DIRS = {
#     "node_modules",
#     ".next",
#     ".git",
#     "dist",
#     "build",
#     ".turbo",
#     ".cache",
#     "coverage",
#     "__pycache__",
#     ".vscode",
#     ".idea"
# }

# IGNORE_FILES = {
#     "package-lock.json",
#     "yarn.lock",
#     "pnpm-lock.yaml"
# }


# def detect_project_type(root):
#     package_json = os.path.join(root, "package.json")

#     if not os.path.exists(package_json):
#         return "Projet inconnu"

#     try:
#         with open(package_json, "r", encoding="utf-8") as f:
#             data = json.load(f)

#         deps = {}
#         deps.update(data.get("dependencies", {}))
#         deps.update(data.get("devDependencies", {}))

#         if "next" in deps:
#             return "Next.js"

#         if "react" in deps:
#             return "React"

#         if "@angular/core" in deps:
#             return "Angular"

#         if "vue" in deps:
#             return "Vue.js"

#         if "@nestjs/core" in deps:
#             return "NestJS"

#     except Exception:
#         pass

#     return "Projet JavaScript"


# def should_ignore(path):
#     name = os.path.basename(path)

#     if name in IGNORE_DIRS:
#         return True

#     if name in IGNORE_FILES:
#         return True

#     return False


# def count_files(directory):
#     total = 0

#     for root, dirs, files in os.walk(directory):
#         dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
#         total += len(files)

#     return total


# def build_tree(directory, prefix=""):
#     lines = []

#     try:
#         items = sorted(
#             os.listdir(directory),
#             key=lambda x: (
#                 not os.path.isdir(os.path.join(directory, x)),
#                 x.lower()
#             )
#         )
#     except PermissionError:
#         return []

#     items = [
#         item for item in items
#         if not should_ignore(os.path.join(directory, item))
#     ]

#     for i, item in enumerate(items):
#         path = os.path.join(directory, item)
#         last = i == len(items) - 1

#         connector = "└── " if last else "├── "

#         if os.path.isdir(path):
#             nb_files = count_files(path)
#             lines.append(f"{prefix}{connector}{item}/ ({nb_files} fichiers)")
#             extension = "    " if last else "│   "
#             lines.extend(build_tree(path, prefix + extension))
#         else:
#             lines.append(f"{prefix}{connector}{item}")

#     return lines


# def generate_mermaid(directory):
#     lines = ["graph TD"]

#     node_counter = 0

#     def walk(path, parent_id=None):
#         nonlocal node_counter

#         current_id = f"N{node_counter}"
#         node_counter += 1

#         label = os.path.basename(path) or path
#         lines.append(f'{current_id}["{label}"]')

#         if parent_id:
#             lines.append(f"{parent_id} --> {current_id}")

#         if os.path.isdir(path):
#             try:
#                 children = sorted(os.listdir(path))
#             except Exception:
#                 return

#             for child in children:
#                 child_path = os.path.join(path, child)

#                 if should_ignore(child_path):
#                     continue

#                 walk(child_path, current_id)

#     walk(directory)

#     return "\n".join(lines)


# def main():
#     root = input("Chemin du projet : ").strip()

#     if not os.path.isdir(root):
#         print("Répertoire invalide")
#         return

#     project_type = detect_project_type(root)

#     tree = [
#         f"# Structure du projet",
#         "",
#         f"**Type détecté :** {project_type}",
#         "",
#         "```text",
#         os.path.basename(os.path.abspath(root))
#     ]

#     tree.extend(build_tree(root))
#     tree.append("```")

#     markdown_content = "\n".join(tree)

#     with open("structure.md", "w", encoding="utf-8") as f:
#         f.write(markdown_content)

#     with open("diagramme.mmd", "w", encoding="utf-8") as f:
#         f.write(generate_mermaid(root))

#     print("✅ structure.md généré")
#     print("✅ diagramme.mmd généré")


# if __name__ == "__main__":
#     main()

# #put mmd here and export in pdf
# #https://mermaid.live/edit?utm_source=chatgpt.com#pako:eNqFmk2P2zgShv9Kw-e0YVKf7MMCg2lkL7uDBZLTpgcDta22hciSV5K74w3y35eseouWJVp7ChwVi9RTpSLfYv9cbdtduXpa7bvidHj4-vzSvTR_bL69rPpu-7L6k34q-7NoqrrqB_mvzcPj498e_lD0Q9vnXfmfc9kPvR_DBpp-RNbgWDT7ol_Dbn211GwZ0Y_YWg6XUzlxE9OPxK3jdJqsIaEfqX0Wb2J5lvCzlH5k9tmp2Jd20h9ikLJBRj9y5_i1PQ-T4Tn9MIHhORsYXqTjVeyOVTMZrzb83AGsjqe28xMoAcgElQ7MofDyiiGqKGQjfhifcvzOfdn1MwNGqJKQkxg2jFKlxLmavgzDVI7mt6H9XjZ_egegqRinyn28vUUGC0aqDKXMtj1as12582bgqhisdmA7G5dylC_KILUYrnZw7RtX5WwyjfR0cL9VO79cLcnJYLUDuz3Y9Za7YvCpp5GYmtFqh_a9DTxnsjoJrFWDrGaymsjW9WwhjFY7tJWHoUFVM1WdhyaQV2Wu2oRsxA9DjRzUj6Iaps8jBhqpm1VESKCIYUY6MEOE94jwuTugb21dtx_TN40YZuRgjmFHEZ4zzCgEMwLMiGFGachG_DDRKAvnmV8Oo41CaCOgjRht5NCemzuvxWjjUL5GyNeY8caK_LgAzNcTM-Q4BDkWG4YcRwhjwAtqaRzyAkAxg44TFIzptxMz5NhBrtvCzxGjGsQMOM5CcyChYqYb59PyKPUiZrSxkXrhPaAOxMw12cwKaAyqCVNNVGAdiewQTDXRVCmKbnuYeWGmSRTygu88YapJPKs3stoE25Rjui-bzmd3gsxNGGoSytwEYBMGm2SzV_ZeGGsSStoE4UuYbGJmr-y9MNrUod2VQ1HVVyegkjLbNMQ2BduU2aZg27fNc1ncePOWzDgNMU7BOGXGaShz_aqYcuooD8V-_hwHghDkVM4FDDl1kM8nV4h-u1ZlIZQy5zTEOQXnlDmnZvIZSUqkTDnb3Bb-FGvNmHAWIpyBW8aEM0e4arZF18y8MNksRDYD2YzJZkTWHsDarnzsy76v2rk7BpyFanAGNhlDzlLKUnue6KffdoazV6hAZGLDhLPAeUEsmG9mJlt4Br4Z880nfOVxznxzNf0ivQHDzen81Z7OddHNTJhuHqKbg27OdPN5bZAXyRlqnkxeJAfQnIHmDmj5oxqdpHM5jDLQPAQ0l1lwng2lrPfDSPNpyvrnjNQ4pN-cwXi1SBHDXE0obw3y1jBao29DIy9sGKsJYTXAahiriafh806YqgmlqhEbJmsc2bar9lXz17Y9N0N3mXljwiZE2ICwYcImnyeMdwPZEDqLGREOohwc5VPX7s7bwX6KdmXHk5Va1_wRp9YSI0LM7VMxg6DY6Klj98pBx5AXmyjoWIsZFMYmntTdqyNIjE0SdOTNoDI2LiBDVzR9PToIeimxgdzYZEFv3gySY5NPDzLeApJjM60h9omYIBok5Cbf78aIUhMxp24TWl21HNir0PFNeTkneo4EHRXPgCvQVnHQVSRmQE6yrrCRfq-Gy_z9RNipNOhNBJ4oPJJ4xXk4BDwBN0m8ut2PznRe4onGUyY4m3cF6CTyrKuR_L76gshTOpj1WnBpkdGadpKqDngCdR1McxFzCmpPad4o97YSj3Lq6g3gg6pPiexT0H2KhJ_ddsvhqxPOAX9ATxJw25XjL0L0mYIQVEElqLT3Bf4kBk_ttWkz8gT2UVBga0l5KEIVhemLN0hDRdrw3X4-b3feMpJORjRdWST8IRBVFEx8kXcKOlEFheLIG_iTVix31TDPaChFRVLxtbiuOvKvB-xBlagi_3LATkLx9tO4ugL3oFBUohQVpKIirXgq-v6j7XZzb1CLKigXlehFBcGo4nCBFxCxtJBot63b16Lu19u-n7aBoBwVSce6uFiH42aSNwN6UpDHsnG70NwX4MdZsC3lXxQRICU5NfO-wD82syLuTYCf9OTNViBCUEFPqkSFViSKUkFSKtKUx8u4NTryBfBJsHMnulJBWCooy7FYG_mS_l2wgZf4Dh6ok8R03YE7KwP3JMg9Ee5QmiqZbq4CFDJTJfOcTySvIDQVKc35XLIkiE1FatMeXN5GRdz7gtpUJDe_NcWxHPUgJd8hNFUaxC5SU0FrqjRY6a9TAnwaBJ8K-FR6p77SP84-3KtP4E-D-FPBDwGqSIG-7nbT5jvEpyL1eayqXV1-FN3oKOXnQwhIhro4ro_VDtbjWiAKUEGXKhKmx3ZX1nOn0KWKhCk5HXnKJBjQpiqTkr-3U96Z3XtGZCBWJxcLVzNEhoQq9ZceSUQG7hiU6FYF4apIufIgrhXLo6T3nYlSXTZH4EjYNq9fbibow0MQy-xavZanQEhzH9Ila-hgRULYaYy2sRW5nyYU1LDKWbOV3bB-bX_cJGcugYUsVqSLt8VQ2M8_YIVQkjL-na3-NU34XHZ1iGRFKtkWAPtB9ndmRxhJL7-17UDpFzJE5Eg2H8pid9dQ7i5czA7t-107BCo36IzeNUSESEgfz_VQfSnrcjs8d-1p13404VFQ1oqltbuT-Ewc7lgjYEb7rPlH1Q93jBExktz9eyBa0NuKBPfreRjslr22ljf-jEQL4luR-t4eyu33BVvEi1T4tq1bG1hXVxZGIHCkxstLubQQhI5EOafNgrHcQBlOCJvj923lGmpDOXHu9rWt6XftNTS6Jo3-vbwsWOJqimQ6i58FY9xTkULnrXHBGNdVpNP7Y1WXl6UV4_KKNHs_FN2SLS6xSLj3H9WwPfxzKYQaEl6ThB-qsqPcvG-Oey6S8sNx97pgiusu0vTn02_N7tl9UfftEUgS-MOhPJZfaP13viut5G5RjVb-97Ipu2Jo741BSEn9b-2XMxTzEqsh_jWJ_-JUrflATvbjOzslt4voBGjqBBSn0_8fgJBSTwAt3iVzRJV6A0SdbPuwMSJKHYJD236fvR5iqHBiRMl_tv_cOPQ3tAikMrf2VX-y0iI8BLHUm5shn_12MR8iV8XURair1-mq_UWxvr351tebYoSN74q7y2loxzP5u2C5LEb7oLcbbV8GzBAjah-4TstabG-8yu2xXB9TG8GW-Xfa7pcGIE7UTsDpYMkcUaPGwtaGtbq18xQQLeosuFuT9clWjJuT38gYcaIew6HoD0ErtBg0tRhc5yZshQBRh4EvbOhQ9blrj19dzgYHyfU-_flJ6Mgp8UfTQVPToR8udTk3QcQif9hck-FYIWu5odboO-govTlILY1AxKgNsZMjwtIAxIy6EjgBLZkjdJG5noOWzBG8eHM95SyYo2GhqWFBOnDRGtGM5dbltGiNMFL7AifjJXP5cw2KZV25lW8LWzT7vqwXByLC1NfAwCVzhJj6G26LqGlzWxiACFOvwxXaaYqhy6GpyzGVPfapmCGS1OcY7koFLVeQGl0PTV0P98dVs-RG00NT02Nc_xJvgZAlWrYtX0-sw_G0iXx-6H5o6n6Mu8kjE8SKOh9UBmfeZAdP5K9skqvcmFv75SI41AbBX57dN0ZgqBkCnveNESTfEvm9bYbyx82R29siUtQdOQ-jO3FvgdBQb4RPrhCL47nlD57SzerTat9Vu9XT0J3LT6tj2dmSaX-ufr40Dw842rysnh5cee7s7vzS_LJjTkXz77Y9yjD7MewPq6e3ou7tLy6nz1Wx74qrSdns3Ludm2H1ZAy5WD39XP1YPT3a7dSsTWT37liltszr7NPqsnrKknUamSjOTZSmJkriX59W_6VZs7XamMyevJNMm00ex7_-B-AVbys
