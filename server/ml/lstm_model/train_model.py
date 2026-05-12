"""
Train the Bidirectional LSTM model for Alzheimer's diagnosis prediction.
Replicates the pipeline from lstm-gru-masking-no-masking.ipynb.

Saves:
  - model weights  → server/ml/lstm_model/model_weights/lstm_model.keras
  - fitted scaler   → server/ml/lstm_model/model_weights/scaler.joblib

Usage:
  python -m ml.lstm_model.train_model
  (run from the server/ directory)
"""

import warnings, os
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.regularizers import l2
from tensorflow.keras.preprocessing.sequence import pad_sequences
import joblib

# ── Constants ─────────────────────────────────────────────────────────────
SEED = 42
FEATURE_COLS = ['entry_age', 'CDGLOBAL', 'MMSCORE', 'TOTSCORE', 'visit_month']
TARGET_COL = 'DIAGNOSIS'
MAX_LEN = 3
NUM_CLASSES = 3
LABEL_NAMES = ['CN', 'MCI', 'AD']

KEEP_VISITS = ['bl_sc', 'm06', 'm12', 'm24', 'm36', 'm48', 'm60', 'm72', 'm84', 'm78']

# ── Paths ─────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, '..', '..', 'shortened_result-val.csv')
WEIGHTS_DIR = os.path.join(SCRIPT_DIR, 'model_weights')

np.random.seed(SEED)
tf.random.set_seed(SEED)


def visit_to_month(v):
    if v == 'bl_sc':
        return 0
    return int(v[1:])


def combine(row, col):
    val_bl = row[f"{col}_bl"]
    val_sc = row[f"{col}_sc"]
    return val_bl if pd.notna(val_bl) else val_sc


def preprocess_data(df):
    """Full preprocessing pipeline from the notebook."""
    # Convert 1,2,3 → 0,1,2
    df['DIAGNOSIS'] = df['DIAGNOSIS'].astype(int) - 1

    # ── Filter bl + sc ──
    df_bl_sc = df[df['visit'].isin(['bl', 'sc'])].copy()

    # ── Pivot ───
    pivot = df_bl_sc.pivot_table(
        index='subject_id', columns='visit',
        values=['MMSCORE', 'TOTSCORE', 'CDGLOBAL'], aggfunc='first'
    )
    pivot.columns = ['_'.join(col) for col in pivot.columns]
    expected_cols = ['MMSCORE_bl', 'MMSCORE_sc', 'TOTSCORE_bl', 'TOTSCORE_sc', 'CDGLOBAL_bl', 'CDGLOBAL_sc']
    for col in expected_cols:
        if col not in pivot.columns:
            pivot[col] = np.nan
    pivot = pivot.reset_index()

    condition = (
        (pivot['MMSCORE_bl'].isna() & pivot['MMSCORE_sc'].notna()) |
        (pivot['MMSCORE_sc'].isna() & pivot['MMSCORE_bl'].notna()) |
        (pivot['TOTSCORE_bl'].isna() & pivot['TOTSCORE_sc'].notna()) |
        (pivot['TOTSCORE_sc'].isna() & pivot['TOTSCORE_bl'].notna()) |
        (pivot['CDGLOBAL_bl'].isna() & pivot['CDGLOBAL_sc'].notna()) |
        (pivot['CDGLOBAL_sc'].isna() & pivot['CDGLOBAL_bl'].notna())
    )
    candidates = pivot[condition]
    candidate_ids = candidates['subject_id'].tolist()

    # ── Merge bl + sc ──
    df_bl = df[df['visit'] == 'bl'].copy()
    df_sc = df[df['visit'] == 'sc'].copy()
    merged = pd.merge(df_bl, df_sc, on='subject_id', suffixes=('_bl', '_sc'))

    cols_to_merge = [
        'entry_age', 'CDGLOBAL', 'MMSCORE', 'TOTSCORE',
        'DIAGNOSIS', 'num_visits', 'num_dirty_rows', 'num_dirty_mmse',
        'num_dirty_cdglobal', 'num_dirty_totscore'
    ]
    merged_rows = []
    for _, row in merged.iterrows():
        new_row = {'subject_id': row['subject_id'], 'visit': 'bl_sc'}
        for col in cols_to_merge:
            new_row[col] = combine(row, col)
        merged_rows.append(new_row)
    df_bl_sc_merged = pd.DataFrame(merged_rows)

    df_clean = df[~df['visit'].isin(['bl', 'sc'])].copy()
    df_clean = pd.concat([df_clean, df_bl_sc_merged], ignore_index=True)

    # ── Filter visits ──
    df_filtered = df_clean[df_clean['visit'].isin(KEEP_VISITS)].copy()
    df_filtered['visit_month'] = df_filtered['visit'].apply(visit_to_month)
    df_filtered = df_filtered.sort_values(['subject_id', 'visit_month']).reset_index(drop=True)

    return df_filtered


def create_windows(df):
    X, y = [], []
    for pid, group in df.groupby('subject_id'):
        group = group.sort_values('visit_month').reset_index(drop=True)
        n = len(group)
        if n < 3:
            continue
        for i in range(2, n):
            start = max(0, i - 3)
            seq = group.iloc[start:i][FEATURE_COLS].values
            target = group.iloc[i][TARGET_COL]
            X.append(seq)
            y.append(target)
    return X, y


def build_model(input_shape):
    model = Sequential()
    model.add(Bidirectional(
        LSTM(64, return_sequences=False, dropout=0.2, recurrent_dropout=0.1),
        input_shape=input_shape
    ))
    model.add(BatchNormalization())
    model.add(Dense(32, activation='relu', kernel_regularizer=l2(1e-4)))
    model.add(Dropout(0.3))
    model.add(Dense(NUM_CLASSES, activation='softmax'))
    return model


def main():
    print("=" * 60)
    print("LSTM Training Pipeline for Alzheimer's Diagnosis Prediction")
    print("=" * 60)

    # ── Load Data ──
    print(f"\n[1/7] Loading data from {DATA_PATH} ...")
    df = pd.read_csv(DATA_PATH)
    print(f"  Shape: {df.shape}")

    # ── Preprocess ──
    print("[2/7] Preprocessing ...")
    df_filtered = preprocess_data(df)
    print(f"  Filtered shape: {df_filtered.shape}")

    # ── Train/Test Split ──
    print("[3/7] Splitting into train/test ...")
    unique_subjects = df_filtered['subject_id'].unique()
    train_ids, test_ids = train_test_split(unique_subjects, test_size=0.2, random_state=SEED)
    train_df = df_filtered[df_filtered['subject_id'].isin(train_ids)].copy()
    test_df = df_filtered[df_filtered['subject_id'].isin(test_ids)].copy()
    print(f"  Train patients: {len(train_ids)}, Test patients: {len(test_ids)}")

    # ── Create Windows ──
    print("[4/7] Creating sliding windows ...")
    X_train_raw, y_train = create_windows(train_df)
    X_test_raw, y_test = create_windows(test_df)
    y_train = np.array(y_train).astype(int)
    y_test = np.array(y_test).astype(int)

    X_train = pad_sequences(X_train_raw, maxlen=MAX_LEN, dtype='float32', padding='pre', value=0.0)
    X_test = pad_sequences(X_test_raw, maxlen=MAX_LEN, dtype='float32', padding='pre', value=0.0)
    print(f"  X_train: {X_train.shape}, X_test: {X_test.shape}")

    # ── Scale ──
    print("[5/7] Scaling features ...")
    X_train = np.nan_to_num(X_train, nan=0.0)
    X_test = np.nan_to_num(X_test, nan=0.0)

    scaler = MinMaxScaler()
    X_train_2d = X_train.reshape(-1, X_train.shape[-1])
    X_test_2d = X_test.reshape(-1, X_test.shape[-1])
    X_train = scaler.fit_transform(X_train_2d).reshape(X_train.shape)
    X_test = scaler.transform(X_test_2d).reshape(X_test.shape)

    # ── Class Weights ──
    classes = np.unique(y_train)
    class_weights = compute_class_weight(class_weight='balanced', classes=classes, y=y_train)
    class_weight_dict = dict(zip(classes.astype(int), class_weights))
    print(f"  Class weights: {class_weight_dict}")

    # ── Build & Train Model ──
    print("[6/7] Building and training model ...")
    model = build_model((X_train.shape[1], X_train.shape[2]))
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    model.summary()

    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=3, min_lr=1e-5)

    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=30,
        batch_size=32,
        class_weight=class_weight_dict,
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )

    # ── Evaluate ──
    y_pred_probs = model.predict(X_test)
    y_pred = np.argmax(y_pred_probs, axis=1)
    from sklearn.metrics import classification_report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=LABEL_NAMES))

    # ── Save ──
    print("[7/7] Saving model and scaler ...")
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    model_path = os.path.join(WEIGHTS_DIR, 'lstm_model.keras')
    scaler_path = os.path.join(WEIGHTS_DIR, 'scaler.joblib')
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    print(f"  Model saved to: {model_path}")
    print(f"  Scaler saved to: {scaler_path}")
    print("\n✅ Training complete!")


if __name__ == '__main__':
    main()
