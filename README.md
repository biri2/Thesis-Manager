# Thesis Manager Dashboard

Thesis Manager is a lightweight organisational and conceptual tool designed to support the management of a Master's thesis in macroeconomics. It centralises literature tracking, progress monitoring and formal model definitions for projects involving heterogeneous-agent DSGE frameworks, monetary policy and non-linear risk. The tool is intentionally separate from numerical analysis and code execution; all economic modelling, estimation and simulation are carried out externally. Instead, Thesis Manager serves as a structured intellectual workspace, ensuring consistency between theory, references, deliverables and model architecture throughout the research process, from the initial design stage to the final writing stage.

> [!IMPORTANT]
> This repository contains the **interactive management UI**. The scientific simulation engines (Python/MATLAB) are typically integrated as external submodules or sibling repositories.

> [!NOTE] > **Status**: Ready for research usage. Documentation is continuously updated.

## ✨ Features

- **Model Blueprint**: Interactive visualization of model scope, variable timing, and stochastic shock registries with real-time KaTeX math rendering.
- **Consistency Dashboard**: Automated structural integrity checks across YAML specifications and Markdown documentation.
- **Progress Tracker**: Multi-level task management with persistent local storage and flip-card note system.
- **Literature Explorer**: Categorized bib-registry with glassmorphic cards and reading status tracking.
- **Data Matrix**: Dynamic registry for managing empirical sources and model analogs.

## 🛠️ Technical Stack

- **Backend**: [Flask](https://flask.palletsprojects.com/) (Python 3.11+)
- **Frontend**: Vanilla JS (ES6+), CSS Grid/Flexbox, Phosphor Icons
- **Math**: [KaTeX](https://katex.org/) for high-speed mathematical typesetting
- **Data Formats**: YAML (Model Specs), JSON (Registry), Markdown (Documentation)
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start (Docker)

The easiest way to run the manager on any machine.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Open: [http://localhost:5050](http://localhost:5050)

---

## 💻 Local Setup (Python)

1. **Install Python 3.11+**.
2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   ```
3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

   _(This file contains the minimal dependencies for the dashboard)_

4. **Run**:
   ```bash
   python app.py
   ```

---

## 📂 Project Structure

- `app.py`: Core routing and consistency checking engine.
- `static/`: Modern design tokens, glassmorphic UI logic, and icons.
- `templates/`: Jinja2 templates for dashboard modules.
- `Deliverables/`: Canonical source for model specifications (YAML/MD).
- `Thesis/thesis/docs/`: Dynamic data and model registries.

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

## ✍️ Author

**Jauder Uribarri** - [@biri2](https://github.com/biri2)
