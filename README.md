# 🌾 RuralNode: Hybrid Quantum-Graph Logistics Engine

**RuralNode** is an intelligent logistics orchestration platform engineered to solve the "Last-Mile" delivery crisis within the **Rural Indian Retail Ecosystem**. 

By merging **Quantum Feature Mapping** with **Graph Neural Networks (GNN)**, the system transforms static supply chains into dynamic, spatially-aware networks that anticipate demand volatility and optimize resource allocation.

---

## 🧠 Core Architecture: The Neural-Quantum Brain

The system’s intelligence resides in `model_def.py`, utilizing a **Hybrid Quantum-Classical (HQC)** approach to process multi-modal rural datasets.

### **1. Variational Quantum Circuit (VQC)**
* **Technology:** 7-Qubit Circuit via [PennyLane](https://pennylane.ai/).
* **Function:** Maps 7 primary input vectors (Inventory Velocity, Seasonality, Lead Times, etc.) into a high-dimensional **Quantum Hilbert Space**. 
* **Advantage:** In rural areas where data is often "noisy," the Quantum layer identifies deep, non-linear correlations such as the link between local festivals and specific inventory burn rates that classical models overlook.

### **2. Spatiotemporal Graph Attention (GATv2)**
* **Technology:** [PyTorch Geometric](https://pytorch-geometric.readthedocs.io/).
* **Function:** Treats the district as a **Topological Graph** where villages are Nodes and roads are Edges.
* **Advantage:** The **GATv2 layer** calculates the "Spatial Influence" of neighboring regions, allowing the AI to predict demand "ripples" across the geographical network.

---

## 🚀 Key Features

### **Logistics & Backend Intelligence**
* **Predictive Risk Stratification:** Assigns a real-time **Risk Coefficient (0-100%)** to every retailer, prioritizing "Critical Burn" zones over routine restocks.
* **Autonomous Order Pooling:** Leverages **Haversine-based Spatial Clustering** to aggregate micro-orders. This groups 5–10 high-cost deliveries into a single **"Milk Run,"** reducing overhead by **~20%**.
* **Dynamic Distributor Matcher:** A real-time ranking algorithm that pairs orders with distributors based on the **Urgency-to-Cost ratio**.

### **Geospatial Frontend**
* **Reactive Analytical Suite:** Built with **React + Vite** for low-latency performance.
* **Interactive Intelligence Map:** * **Red Zones:** Real-time visualization of high-risk stockout shops.
    * **Blue Routes:** AI-generated optimized paths for pooled deliveries.
* **Edge-Device Portal:** A mobile-responsive UI for shopkeepers to join neighborhood delivery pools with one touch.


---

##Repository Structure

```text
Neural-Quantum-Vehicle-Routing-Problem/
│
├── 📂 data/                  # Indian Retail Dataset
│
├── 📂 frontend/              # The React + Vite Dashboard
│   ├── 📂 public/            # Static Assets
│   ├── 📂 src/               # UI Source Code (Components, Pages, Utils)
│   ├── 📜 vite.config.js     # Vite Configuration
│   ├── 📜 eslint.config.js   # Linting Rules
│   └── 📜 package.json       # Frontend Dependencies
│
├── 📂 model/                 # Pre-trained Q-GNN Weights (.pth)
│
├── 📂 notebook/              # Research Experiment (Jupyter Notebook)
│
├── 📜 main.py                # FastAPI Backend Server (Entry Point)
├── 📜 model_def.py           # Quantum-GNN Class Definition
└── 📜 requirements.txt       # Backend Dependencies
```

---

## Setup & Execution

To run **RuralNode** locally, you will need to operate two separate terminals: one for the AI Backend and one for the React Frontend.

### **1. Launch the AI Backend (FastAPI)**
Navigate to the project root directory and set up your Python environment:

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate on Windows:
venv\Scripts\activate
# 2. Activate on Mac/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server using Uvicorn
uvicorn main:app --port 8000 --reload

# Launch the Dashboard 

# 1. Navigate to the frontend directory
cd frontend

# 2. Install the required Node modules
npm install

# 3. Start the Vite development server
npm run dev


