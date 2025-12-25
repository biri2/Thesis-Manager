from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import json
import yaml
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev_key_for_thesis_manager'

# --- Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/reading_list')
def reading_list():
    return render_template('reading_list.html')

@app.route('/thesis')
def thesis():
    return render_template('thesis.html')

@app.route('/progress')
def progress():
    return render_template('progress.html')

@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

@app.route('/models')
def models():
    return render_template('models.html')

@app.route('/data')
def data_matrix():
    return render_template('data.html')

@app.route('/model-blueprint')
def model_blueprint():
    return render_template('model_blueprint.html')

@app.route('/api/models')
def get_models_api():
    try:
        registry_path = os.path.join('Thesis', 'thesis', 'docs', 'models_registry.yaml')
        with open(registry_path, 'r') as f:
            data = yaml.safe_load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Data Registry API ---

DATA_REGISTRY_PATH = os.path.join('Thesis', 'thesis', 'docs', 'data_registry.json')

def load_data_registry():
    if not os.path.exists(DATA_REGISTRY_PATH):
        return []
    with open(DATA_REGISTRY_PATH, 'r') as f:
        return json.load(f)

def save_data_registry(data):
    with open(DATA_REGISTRY_PATH, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(load_data_registry())

@app.route('/api/data', methods=['POST'])
def add_data():
    data = load_data_registry()
    new_item = request.json
    # Basic ID generation if not provided
    if 'id' not in new_item:
        new_item['id'] = new_item['name'].lower().replace(' ', '_')
    data.append(new_item)
    save_data_registry(data)
    return jsonify(new_item), 201

@app.route('/api/data/<item_id>', methods=['PUT'])
def update_data(item_id):
    data = load_data_registry()
    updated_item = request.json
    for i, item in enumerate(data):
        if item['id'] == item_id:
            data[i] = updated_item
            save_data_registry(data)
            return jsonify(updated_item)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/data/<item_id>', methods=['DELETE'])
def delete_data(item_id):
    data = load_data_registry()
    new_data = [item for item in data if item['id'] != item_id]
    if len(new_data) < len(data):
        save_data_registry(new_data)
        return jsonify({"status": "deleted"})
    return jsonify({"error": "Not found"}), 404

@app.route('/literature/<path:filename>')
def serve_literature(filename):
    return send_from_directory('literature', filename)

# --- API ---

@app.route('/api/get_readings')
def get_readings_api():
    # Full Reading List from templates/reading_list.html
    readings = [
        {
            "id": "kaplan_moll_violante_2018",
            "title": "Monetary Policy According to HANK",
            "authors": "Greg Kaplan, Benjamin Moll, Giovanni L. Violante — 2018"
        },
        {
            "id": "auclert_2019_redistribution",
            "title": "Monetary Policy and the Redistribution Channel",
            "authors": "Adrien Auclert — 2019"
        },
        {
            "id": "kaplan_violante_weidner_2014_h2m",
            "title": "The Wealthy Hand-to-Mouth",
            "authors": "Greg Kaplan, Giovanni L. Violante, Justin Weidner — 2014"
        },
        {
            "id": "boehl_2024_hank_on_speed",
            "title": "HANK on Speed: Robust Nonlinear Solutions using AD",
            "authors": "Gregor Boehl — 2024"
        },
        {
            "id": "auclert_et_al_2021_ssj",
            "title": "Using the Sequence-Space Jacobian to Solve HANK Models",
            "authors": "Adrien Auclert, Bence Bardóczy, Matthew Rognlie, Ludwig Straub — 2021"
        },
        {
            "id": "fv_gq_2020_dsge_estimation",
            "title": "Estimating DSGE Models: Recent Advances",
            "authors": "Jesús Fernández-Villaverde, Pablo Guerrón-Quintana — 2020"
        },
        {
            "id": "kase_melosi_rottner_2025_nn_hank",
            "title": "Estimating Nonlinear HANK Models with Neural Networks",
            "authors": "Hanno Kase, Leonardo Melosi, Matthias Rottner — 2025"
        },
        {
            "id": "fv_2025_deep_learning_solve",
            "title": "Deep Learning for Solving Economic Models",
            "authors": "Jesús Fernández-Villaverde — 2025"
        },
        {
            "id": "maliar_maliar_winant_2021_dl_dynamic",
            "title": "Deep Learning for Solving Dynamic Economic Models",
            "authors": "Lilia Maliar, Serguei Maliar, Pablo Winant — 2021"
        },
        {
            "id": "cantelmo_2022_rare_disasters",
            "title": "Rare Disasters, the Natural Interest Rate and Monetary Policy",
            "authors": "Antonio Cantelmo — 2022"
        },
        {
            "id": "kara_thakoor_2023_climate_shocks",
            "title": "Monetary Policy Design with Recurrent Climate Shocks",
            "authors": "Gazi Kara, Arvind Thakoor — 2023"
        },
        {
            "id": "fv_levintal_2018_rare_disaster_methods",
            "title": "Solution Methods for Models with Rare Disasters",
            "authors": "Jesús Fernández-Villaverde, Oren Levintal — 2018"
        },
        {
            "id": "bilal_kanzig_global_local_temp",
            "title": "The Macroeconomic Impact of Climate Change",
            "authors": "Adrien Bilal, Diego R. Känzig — 2025"
        },
        {
            "id": "dell_jones_olken_2012_temp_growth",
            "title": "Temperature Shocks and Economic Growth",
            "authors": "Melissa Dell, Benjamin F. Jones, Benjamin A. Olken — 2012"
        },
        {
            "id": "fv_hurtado_nuno_2023_ff_wealth",
            "title": "Financial Frictions and the Wealth Distribution",
            "authors": "Jesús Fernández-Villaverde, Samuel Hurtado, Galo Nuño — 2023"
        },
        {
            "id": "gertler_karadi_2011_ump",
            "title": "A Model of Unconventional Monetary Policy",
            "authors": "Mark Gertler, Peter Karadi — 2011"
        },
        {
            "id": "gertler_kiyotaki_2010_intermediation",
            "title": "Financial Intermediation and Credit Policy",
            "authors": "Mark Gertler, Nobuhiro Kiyotaki — 2010"
        },
        {
            "id": "bgg_1999_financial_accelerator",
            "title": "The Financial Accelerator",
            "authors": "Ben Bernanke, Mark Gertler, Simon Gilchrist — 1999"
        },
        {
            "id": "kiyotaki_moore_1997_credit_cycles",
            "title": "Credit Cycles",
            "authors": "Nobuhiro Kiyotaki, John Moore — 1997"
        },
        {
            "id": "brunnermeier_sannikov_2014",
            "title": "A Macroeconomic Model with a Financial Sector",
            "authors": "Markus Brunnermeier, Yuliy Sannikov — 2014"
        },
        {
            "id": "garcia_posada_paz_2024_credit_supply",
            "title": "The Transmission of Monetary Policy to Credit Supply",
            "authors": "Miguel García-Posada, Peter Paz — 2024"
        },
        {
            "id": "jst_2013_when_credit_bites_back",
            "title": "When Credit Bites Back",
            "authors": "Òscar Jordà, Moritz Schularick, Alan M. Taylor — 2013"
        },
        {
            "id": "ottonello_winberry_2018_investment_channel",
            "title": "Financial Heterogeneity and the Investment Channel",
            "authors": "Pablo Ottonello, Thomas Winberry — 2018"
        },
        {
            "id": "bianchi_melosi_2017_escaping",
            "title": "Escaping the Great Recession",
            "authors": "Francesco Bianchi, Leonardo Melosi — 2017"
        },
        {
            "id": "chen_pelger_zhu_2021_dl_asset_pricing",
            "title": "Deep Learning in Asset Pricing",
            "authors": "Luyang Chen, Markus Pelger, Jason Zhu — 2021"
        },
        {
            "id": "ilut_luetticke_schneider_2025_uncertainty",
            "title": "HANK’s Response to Aggregate Uncertainty",
            "authors": "Cosmin Ilut, Ralph Luetticke, Martin Schneider — 2025"
        }
    ]
    return jsonify(readings)

# --- Model Blueprint API ---

MODEL_SPECS_DIR = os.path.join('Deliverables', 'D0 - Model Specifications')

def get_model_file_path(name):
    mapping = {
        'scope': 'D0_1_scope.md',
        'shocks': 'D0_1_shocks.md',
        'timing': 'D0_1_timing_sheet.md',
        'states': 'D0_1_states.yaml'
    }
    filename = mapping.get(name)
    if not filename:
        return None
    return os.path.join(MODEL_SPECS_DIR, filename)

@app.route('/api/model/blueprint')
def get_model_blueprint():
    try:
        data = {}
        for key in ['scope', 'shocks', 'timing', 'states']:
            path = get_model_file_path(key)
            if os.path.exists(path):
                with open(path, 'r') as f:
                    data[f"{key}_content"] = f.read()
            else:
                data[f"{key}_content"] = f"# Error: {path} not found"
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/model/file/<name>')
def get_model_file_raw(name):
    path = get_model_file_path(name)
    if not path or not os.path.exists(path):
        return "File not found", 404
    
    directory = os.path.dirname(path)
    filename = os.path.basename(path)
    
    mimetype = 'text/markdown'
    if filename.endswith('.yaml') or filename.endswith('.yml'):
        mimetype = 'text/yaml'
        
    return send_from_directory(directory, filename, mimetype=mimetype)

@app.route('/api/model/states_parsed')
def get_model_states_parsed():
    try:
        path = get_model_file_path('states')
        if not os.path.exists(path):
            return jsonify({"error": "States file not found"}), 404
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Consistency & Registry Logic ---

def parse_md_table(content):
    if not content: return []
    lines = content.split('\n')
    table_lines = []
    in_table = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('|'):
            if '---' in stripped: in_table = True
            table_lines.append(stripped)
        elif in_table:
            break
    if len(table_lines) < 3: return []
    
    headers = [h.strip() for h in table_lines[0].split('|')[1:-1]]
    data_rows = []
    for line in table_lines[2:]:
        if not line.strip(): continue
        data_rows.append([c.strip() for c in line.split('|')[1:-1]])
    return {"headers": headers, "rows": data_rows}

def extract_symbols_from_latex(text):
    if not text: return []
    # Match \( symbol \)
    latex_matches = re.findall(r'\\\(([^)]+)\\\)', text)
    if not latex_matches:
        # Fallback for simple words if they look like symbols
        if re.match(r'^[a-zA-Z0-9_]+$', text.strip()):
            return [text.strip()]
        return []

    symbols = []
    for m in latex_matches:
        # Normalize: strip subscripts _t, _{t+1}, superscripts ^i, etc.
        m = re.sub(r'[_^][{]?[\w\+\-\,]+[}]?', '', m)
        # Strip backslash
        m = m.replace('\\', '').strip()
        # Specific mappings if needed (e.g. pi)
        if m == 'pi': m = 'pi'
        # Split by punctuation
        for s in re.split(r'[,/]', m):
            s = s.strip()
            if s: symbols.append(s)
    return symbols

    return symbols

def build_model_registry():
    # 1. Load Source Text
    data_raw = {}
    for key in ['scope', 'shocks', 'timing', 'states']:
        path = get_model_file_path(key)
        if os.path.exists(path):
            with open(path, 'r') as f: data_raw[key] = f.read()
        else:
            data_raw[key] = ""

    states_yaml = yaml.safe_load(data_raw.get('states', "")) or {}
    registry = {}

    def upsert(sym, category=None, timing=None, source=None, used_in=None, choice=None):
        if not sym: return
        if sym not in registry:
            registry[sym] = {
                "symbol": sym,
                "category": category or "derived",
                "timing": timing or "Law of motion only",
                "defined_in": [],
                "used_in": [],
                "choice": choice
            }
        if category: registry[sym]["category"] = category
        if timing: registry[sym]["timing"] = timing
        if source and source not in registry[sym]["defined_in"]:
            registry[sym]["defined_in"].append(source)
        if used_in:
            if isinstance(used_in, list):
                for u in used_in:
                    if u not in registry[sym]["used_in"]: registry[sym]["used_in"].append(u)
            elif used_in not in registry[sym]["used_in"]:
                registry[sym]["used_in"].append(used_in)
        if choice: registry[sym]["choice"] = choice

    # A. Populate from YAML (Canonical)
    # Households
    for s, meta in states_yaml.get('household_states', {}).items():
        choice_hint = meta.get('timing', {}).get('choice_at_t')
        upsert(s, "household_state", "Predetermined at t", "states.yaml", choice=choice_hint)
    # Aggregates
    for s, meta in states_yaml.get('aggregate_states', {}).items():
        upsert(s, "aggregate_state", "Predetermined at t", "states.yaml")
    # Jumps
    for s, meta in states_yaml.get('aggregate_jumps', {}).items():
        upsert(s, "jump", "Determined at t", "states.yaml")
    # Disasters
    for s, meta in states_yaml.get('disaster_states', {}).items():
        cat = "shock" if meta.get('type') == 'shock' else "aggregate_state"
        timing = "Realized in t" if cat == "shock" else "Predetermined at t"
        upsert(s, cat, timing, "states.yaml")
    # Processes & Innovations
    for p, meta in states_yaml.get('processes', {}).items():
        # User Rule: "A_exo vs e_A is redundant... Keep only e_A". Same for monetary_shock vs e_i.
        # So we skip the process wrapper if it's one of these redudant ones
        if p not in ['A_exo', 'monetary_shock']:
             upsert(p, "process", "Law of motion only", "states.yaml")
        
        if 'shock' in meta:
            s_name = meta['shock'].get('name')
            upsert(s_name, "shock", "Realized in t", "states.yaml")

    # Derived
    for s, meta in states_yaml.get('derived_objects', {}).items():
        upsert(s, "derived", "Law of motion only", "states.yaml")

    # B. Parse Shocks MD
    shocks_table = parse_md_table(data_raw.get('shocks'))
    if shocks_table:
        for row in shocks_table['rows']:
            if len(row) < 3: continue
            # Column 1 is symbol
            symbols = extract_symbols_from_latex(row[1])
            for s in symbols:
                upsert(s, source="shocks.md", used_in=row[6])

    # C. Parse Timing MD
    timing_table = parse_md_table(data_raw.get('timing'))
    if timing_table:
        for row in timing_table['rows']:
            if len(row) < 4: continue
            symbols = extract_symbols_from_latex(row[0])
            for s in symbols:
                timing_val = "Unknown"
                if row[1] == '✅': timing_val = "Predetermined at t"
                elif row[2] == '✅': timing_val = "Determined at t"
                elif row[3] == '✅': timing_val = "Realized in t"
                upsert(s, timing=timing_val, source="timing.md")

    return registry

@app.route('/api/model/registry')
def get_model_registry():
    try:
        registry = build_model_registry()
        return jsonify(registry)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/model/consistency_checks')
def get_model_consistency_checks():
    try:
        registry = build_model_registry()
        
        # Helper to build check object
        def check(name, score, status, msg):
            return {"name": name, "score": score, "status": status, "msg": msg}

        # 1. Structural Integrity
        path_scope = get_model_file_path('scope')
        scope_content = ""
        if os.path.exists(path_scope):
            with open(path_scope, 'r') as f: scope_content = f.read().lower()
        
        required_blocks = ['household', 'firm', 'intermediar', 'monetary', 'disaster']
        missing_blocks = [b for b in required_blocks if b not in scope_content]
        structural_pass = not missing_blocks
        structural_msg = "All core blocks detected in scope." if structural_pass else f"Missing blocks: {', '.join(missing_blocks)}"

        # 2. Timing Coverage
        yaml_symbols = [s for s in registry.values() if "states.yaml" in s["defined_in"]]
        timing_symbols = [s for s in registry.values() if "timing.md" in s["defined_in"]]
        coverage_score = 100 if len(yaml_symbols) <= len(timing_symbols) else 70
        coverage_msg = f"Every state/jump appearing in YAML ({len(yaml_symbols)}) is mapped in Timing sheet ({len(timing_symbols)})."

        # 3. Shock Logic
        shocks = [s for s in registry.values() if s['category'] == 'shock']
        shock_issues = [s['symbol'] for s in shocks if not s['used_in']]
        shock_status = "PASS" if not shock_issues else "WARN"
        shock_msg = "All shocks have targets and entry points." if not shock_issues else f"Shocks missing entry points: {', '.join(shock_issues)}"

        # 4. Disaster Logic
        has_pd = 'pD' in registry
        has_sd = 'sD' in registry
        has_dmg = any(s in registry for s in ['damage_A', 'damage_K'])
        disaster_pass = has_pd and has_sd and has_dmg
        disaster_msg = "pD, sD, and damage wedges are correctly linked." if disaster_pass else "Disaster module incomplete (check pD/sD or wedges)."

        # 5. Naming Consistency (Case sensitivity & collisions)
        # We check if registry keys normalized to lowercase collide
        lowers = [s.lower() for s in registry.keys()]
        collisions = set([x for x in lowers if lowers.count(x) > 1])
        naming_pass = not collisions
        naming_msg = "All symbols follow case-sensitive uniqueness." if naming_pass else f"Collisions detected: {', '.join(collisions)}"

        # 6. Closure Checks
        states = [s for s in registry.values() if 'state' in s['category']]
        orphan_states = [s['symbol'] for s in states if not s['used_in'] and s['symbol'] not in ['pD', 'z', 'i_lag']]
        closure_pass = not orphan_states
        closure_msg = "Every state has clear transition dependency." if closure_pass else f"Orphan states (missing rules): {', '.join(orphan_states)}"

        return jsonify([
            check("Structural Integrity", 100 if structural_pass else 60, "PASS" if structural_pass else "WARN", structural_msg),
            check("Timing Coverage", coverage_score, "PASS" if coverage_score == 100 else "WARN", coverage_msg),
            check("Shock Logic", 100 if not shock_issues else 70, shock_status, shock_msg),
            check("Naming Consistency", 100 if naming_pass else 40, "PASS" if naming_pass else "FAIL", naming_msg),
            check("Disaster Logic", 100 if disaster_pass else 50, "PASS" if disaster_pass else "FAIL", disaster_msg),
            check("Closure Checks", 100 if closure_pass else 60, "PASS" if closure_pass else "WARN", closure_msg)
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",   # REQUIRED
        port=5050,
        debug=True
    )