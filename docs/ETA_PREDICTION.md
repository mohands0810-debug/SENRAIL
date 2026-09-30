# SENRAIL — ETA Prediction Engine

## What ETA Prediction Means

ETA prediction for a coaching train answers: *Given what is known right now about the train's position, speed, and the conditions ahead, when is it most likely to arrive at the destination (and each intermediate station)?*

Unlike a static schedule, the predicted ETA is recalculated continuously as conditions change. The prediction is also **explainable** — the system identifies which specific factors are contributing to any difference between the scheduled and predicted arrival time.

---

## Prediction Inputs

The prediction engine accepts the following features as a `PredictionInput` struct:

| Input | Type | Description |
|---|---|---|
| `trainId` | string | Identifies the train being predicted |
| `currentSpeed` | number (km/h) | Current observed speed |
| `currentDelayMinutes` | number | Current accumulated delay (positive = late) |
| `distanceRemainingKm` | number | Kilometres remaining to destination |
| `currentSectionId` | string | Identifier of the section the train is currently in |
| `congestionLevel` | Low / Moderate / High | Congestion classification for ahead sections |
| `maintenanceActive` | boolean | Whether a maintenance event is active on the route ahead |
| `speedRestriction` | number \| null | Active speed restriction in km/h, if any |
| `weatherCondition` | Clear / Light Rain / Heavy Rain / Fog | Current weather classification |
| `signalDelayMinutes` | number | Discrete signal hold time in minutes |
| `scheduledDestinationETA` | HH:MM | Published scheduled arrival at destination |
| `currentTime` | Date | Current wall-clock time (for ETA computation) |

---

## Prediction Output

The engine returns an `ETAPrediction` struct:

| Output | Type | Description |
|---|---|---|
| `destinationETA` | HH:MM | Predicted arrival time at destination |
| `scheduledETA` | HH:MM | Published scheduled arrival |
| `remainingMinutes` | number | Total predicted remaining travel time |
| `predictedDelayMinutes` | number | Difference between predicted and scheduled ETA |
| `confidence` | number (0–100) | Prototype heuristic confidence indicator |
| `contributingFactors` | ContributingFactor[] | Per-factor breakdown of delay components |
| `lastRecalculated` | HH:MM:SS | Timestamp of this prediction |
| `baselineRemainingMinutes` | number | Baseline estimate before condition adjustments |

---

## Prototype Prediction Approach

The prototype uses a **transparent, formula-based prediction model**. The formula is:

```
remaining_time =
    baseline_time
  + congestion_effect
  + maintenance_effect
  + weather_effect
  + signal_effect
  + historical_variance
  - recovery_component
```

### Step-by-step Computation

**Step 1 — Historical Baseline**

Look up the historical average travel time for the current section under the current weather and congestion conditions using the synthetic historical dataset:

```typescript
historicalBaseline = getHistoricalBaseline(sectionId, weatherCondition, congestionLevel)
```

**Step 2 — Speed-based Estimate**

Compute a speed-based remaining time using the effective speed (accounting for any speed restriction):

```typescript
effectiveSpeed = speedRestriction !== null
  ? min(currentSpeed, speedRestriction)
  : currentSpeed

speedBasedMinutes = (distanceRemainingKm / effectiveSpeed) × 60
```

**Step 3 — Blended Baseline**

Combine historical and speed-based estimates (40% historical, 60% speed-based):

```typescript
blendedBaseline = historicalBaseline × 0.4 + speedBasedMinutes × 0.6
```

This blend gives weight to the actual current speed while anchoring to the historical pattern.

**Step 4 — Condition Effects**

Apply additive adjustments for each active condition:

| Condition | Effect |
|---|---|
| Congestion: Low | +0 min |
| Congestion: Moderate | +5 min |
| Congestion: High | +13 min |
| Track Maintenance (base) | +8 min |
| Speed restriction < 60 km/h | Additional penalty proportional to restriction severity |
| Weather: Clear | +0 min |
| Weather: Light Rain | +4 min |
| Weather: Heavy Rain | +9 min |
| Weather: Fog | +7 min |
| Signal Hold | +N min (as observed) |
| Historical variance | ±1 min (stochastic component) |

**Step 5 — Recovery Component**

If the train is currently running ahead of schedule (negative delay), a small recovery component slightly reduces the predicted remaining time:

```typescript
recoveryEffect = currentDelayMinutes < 0 ? abs(currentDelayMinutes) × 0.1 : 0
```

**Step 6 — Total and ETA**

```typescript
totalRemainingMinutes = blendedBaseline + Σ(condition_effects) - recoveryEffect
destinationETA = currentTime + totalRemainingMinutes
```

**Step 7 — Predicted Delay**

```typescript
predictedDelayMinutes = round(etaMinutes - scheduledETAMinutes)
```

---

## Confidence Heuristic

The `confidence` value is a heuristic indicator, **not a scientifically validated accuracy metric**. It is presented as "Prototype Model Confidence" in the UI.

The heuristic starts at 92% and decreases based on active disruptions:

```
confidence = max(55, min(95, 92 - disruptionPenalty))

disruptionPenalty =
    (congestionLevel === 'High' ? 10 : congestionLevel === 'Moderate' ? 5 : 0)
  + (maintenanceActive ? 5 : 0)
  + (weatherCondition === 'Heavy Rain' ? 8 : 'Fog' ? 6 : 'Light Rain' ? 3 : 0)
  + (signalDelayMinutes > 0 ? 4 : 0)
```

Rationale: When more disruptions are active, the prediction is inherently less certain because the precise duration and propagation of each disruption is unknown.

---

## Per-Station ETA

Station ETAs are computed by proportional distribution of the total remaining time:

```typescript
fraction = distanceToStation / totalDistanceRemaining
stationRemainingMinutes = totalRemainingMinutes × fraction
stationETA = currentTime + stationRemainingMinutes
```

This is a simplification suitable for the prototype. A production model would compute each section independently.

---

## Feature Architecture for Future ML Models

The `PredictionInput` struct is designed to serve as a feature vector for a trained ML model. The same inputs can be passed to a model without changing the interface:

```typescript
// Current: formula-based
const prediction = predictETA(input);

// Future: ML model (same interface)
const prediction = await mlModel.predict(input);
```

### Potential Future Models

| Model | Suitability |
|---|---|
| Random Forest | Handles non-linear interactions between weather, congestion, and delay well |
| XGBoost / Gradient Boosting | Strong performance on structured tabular data; interpretable via SHAP values |
| Gradient Boosting Regressor | Good generalisation with limited training data |
| LSTM / Time-Series Models | Could capture temporal patterns in delay propagation across sections |

### Feature Engineering for ML

With a real dataset, the following additional features would be valuable:
- Day of week and time of day (encoded)
- Station pair travel time (from historical)
- Section occupancy (number of trains in section)
- Ahead-section congestion state
- Rolling average delay over last N stops
- Weather severity index

### Training Approach (Future)

**Target variable:** Actual arrival time at destination − predicted time at recalculation point (residual)

**Training data:** Historical RTIS records with matched operational event data

**Evaluation metrics:** MAE (Mean Absolute Error) in minutes, RMSE, percentage of predictions within ±5 min, ±10 min

**Note:** No ML model has been trained in the current prototype. The formula-based engine provides a transparent, tunable baseline. Any future claim of ML model accuracy must be backed by actual training, validation, and testing on representative data.

---

## Prototype Assumptions

The following assumptions are made in the prototype prediction logic. Each is documented here for transparency:

1. **Speed-based estimate uses current speed as constant** — In reality, speed varies continuously. A production model would integrate over time steps.

2. **Condition effects are additive and section-wide** — In reality, conditions apply to specific sub-sections and their effects may overlap or compound non-linearly.

3. **Historical data is synthetic** — The baseline travel times are representative but not derived from actual RTIS records.

4. **Weather is uniform across the route** — In reality, weather conditions vary by location along the route.

5. **Per-station ETAs are proportionally distributed** — A production model would compute each section independently.

---

*SENRAIL · RUNTIME REBELS · SIH 2026 · PS SIH26028*
