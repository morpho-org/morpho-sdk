import { MathLib } from "@morpho-org/blue-sdk";

export const MAX_SLIPPAGE_TOLERANCE = MathLib.WAD / 10n;

/** Default LLTV buffer: 0.5% below LLTV. Prevents instant liquidation on new positions. */
export const DEFAULT_LLTV_BUFFER = MathLib.WAD / 200n;

/** Maximum allowed LLTV buffer: 10%. */
export const MAX_LLTV_BUFFER = MathLib.WAD / 10n;
