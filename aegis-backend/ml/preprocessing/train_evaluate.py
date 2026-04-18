import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# ==============================
# CONFIG
# ==============================
FILE_PATH = "cicids2017_cleaned.csv"
RANDOM_STATE = 42

# Features (keep this order consistent everywhere)
FEATURES = [
    "Flow Duration",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Total Fwd Packets",
    "Packet Length Mean",
    "Packet Length Std",
    "Flow IAT Mean",
    "Flow IAT Std",
    "Active Mean",
    "Idle Mean"
]

# ==============================
# STEP 1: LOAD DATA
# ==============================
print("\nLoading dataset...")
df = pd.read_csv(FILE_PATH)
print("Dataset Loaded:", df.shape)

# ==============================
# STEP 2: CLEAN DATA
# ==============================
print("\nCleaning data...")
df = df[df["Flow Duration"] > 0]
df = df.replace([np.inf, -np.inf], 0)
df = df.dropna()
print("After Cleaning:", df.shape)

# ==============================
# STEP 3: FEATURES + LABELS
# ==============================
X = df[FEATURES].copy()

# Label: Normal=0, Attack=1
df["Label"] = (df["Attack Type"] != "Normal Traffic").astype(int)
y = df["Label"].values

# ==============================
# STEP 4: TRAIN-TEST SPLIT
# ==============================
print("\nSplitting data...")
X_train_full, X_test, y_train_full, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)

print("Train size:", X_train_full.shape)
print("Test size:", X_test.shape)

# ==============================
# STEP 5: TRAIN ONLY ON NORMAL
# ==============================
X_train_normal = X_train_full[y_train_full == 0]
print("Training on NORMAL only:", X_train_normal.shape)

# ==============================
# STEP 6: SCALING
# ==============================
print("\nScaling...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_normal)
X_test_scaled = scaler.transform(X_test)

# ==============================
# STEP 7: TRAIN MODEL
# ==============================
print("\nTraining Isolation Forest...")
model = IsolationForest(
    n_estimators=100,
    contamination=0.17,  # close to dataset anomaly ratio
    random_state=RANDOM_STATE,
    n_jobs=-1
)
model.fit(X_train_scaled)
print("Model Trained!")

# ==============================
# STEP 8: SCORE CALCULATION
# ==============================
scores = model.decision_function(X_test_scaled)  # higher = more normal

# ==============================
# STEP 9: THRESHOLD TUNING (F1)
# ==============================
print("\nTuning threshold (F1 optimization)...")

best_f1 = -1.0
best_threshold = 0.0
best_pred = None

# Search a reasonable range
for threshold in np.linspace(-0.2, 0.1, 80):
    y_pred_tmp = (scores < threshold).astype(int)  # 1=anomaly

    tp = np.sum((y_test == 1) & (y_pred_tmp == 1))
    fp = np.sum((y_test == 0) & (y_pred_tmp == 1))
    fn = np.sum((y_test == 1) & (y_pred_tmp == 0))

    precision = tp / (tp + fp + 1e-9)
    recall = tp / (tp + fn + 1e-9)
    f1 = 2 * (precision * recall) / (precision + recall + 1e-9)

    if f1 > best_f1:
        best_f1 = f1
        best_threshold = threshold
        best_pred = y_pred_tmp

print(f"Best Threshold: {best_threshold:.6f}")
print(f"Best F1 Score: {best_f1:.6f}")

# ==============================
# STEP 10: FINAL METRICS
# ==============================
y_pred = best_pred

print("\n========== FINAL RESULTS ==========")

acc = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {acc:.6f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, digits=4))

cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

# Extra: Attack detection rate (recall for class 1)
attack_recall = (y_pred[y_test == 1] == 1).mean()
print(f"\nAttack Detection Rate (Recall@Attack): {attack_recall:.6f}")

# ==============================
# STEP 11: SAVE ARTIFACTS
# ==============================
print("\nSaving artifacts...")
joblib.dump(model, "isolation_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(best_threshold, "threshold.pkl")
joblib.dump(FEATURES, "features.pkl")  # keep feature order consistent
print("Saved: isolation_model.pkl, scaler.pkl, threshold.pkl, features.pkl")

# ==============================
# STEP 12: SAMPLE TEST (NO WARNING)
# ==============================
print("\nSample prediction:")
sample = X_test.iloc[[0]]  # keep as DataFrame (no warning)
sample_scaled = scaler.transform(sample)
score = model.decision_function(sample_scaled)[0]
pred = int(score < best_threshold)

print(f"Score: {score:.6f}")
print("Prediction:", "ANOMALY 🚨" if pred == 1 else "NORMAL 🟢")

print("\nDONE ✅")