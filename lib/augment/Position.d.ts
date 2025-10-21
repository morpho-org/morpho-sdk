import { AccrualPosition, Position, PreLiquidationPosition } from "@morpho-org/blue-sdk";
import { fetchAccrualPosition, fetchPosition, fetchPreLiquidationPosition } from "../fetch";
declare module "@morpho-org/blue-sdk" {
    namespace Position {
        let fetch: typeof fetchPosition;
    }
    namespace AccrualPosition {
        let fetch: typeof fetchAccrualPosition;
        let fetchPreLiquidation: typeof fetchPreLiquidationPosition;
    }
}
export { Position, AccrualPosition, PreLiquidationPosition };
